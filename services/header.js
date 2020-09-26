import * as axios from 'axios'
import { getLocalState, insertHeaders, getHeaders, updateHeaders, removeHeaders } from '../utils/db'
import { sleep, processHeader, sha256d } from '../utils'
import { config } from '../config'
const { peer, sleepInterval, reorgThreshold } = config

let chainTip, localState

const init = async() => {
    try {
        //Get local and chain state
        localState = getLocalState().map(h => processHeader(h))
        chainTip = await getChainTip()
        //Handle reorgs on first run
        handleReorg()
        headerSync()
    } catch(e) {
        console.warn(e)
        await sleep(10)
        init()
    }
}

const headerSync = async() => {
    try {
        //Update the local state
        localState = getLocalState().map(h => processHeader(h))
        //If local header equals chainTip, we're all synced up! Sleep for a a moment.
        if(compareHeaders(chainTip, localState[0])){
            console.log("Header Sync <- Chain synced. Sleeping for 10 seconds.")
            await sleep(10)
            chainTip = await getChainTip()
        }
        //Otherwise, if local state is within reorg threshold of chain tip, check for reorgs
        else {
            if((chainTip.height - localState[0].height) <= reorgThreshold) {
                chainTip = await getChainTip()
                await handleReorg()
            }
            //After handling reorgs, extend header store from highest local block
            await syncFrom(localState[0].height+1)
        }
        //Restart the header sync loop
        headerSync()
    } catch (e) {
        //Sleep for a moment on error to avoid overloading the server with logs and reinitialise sync process
        console.warn(e)
        await sleep(10)
        init()
    }
}

const getChainTip = async () => {
    const { data } = await axios.get(`${peer}?format=hex`)
    return data.result.map(h => processHeader(h))[0]
}

const handleReorg = async () => {
    //Ignore reorg for empty header store
    if(localState[0].height===-1) return
    try {
        //Handle reorgs
        console.log(`Header Sync -> Checking for historical reorgs.`)
        const { data } = await axios.get(`${peer}/${localState[0].height}?limit=${localState.length}&format=hex&order=desc`)
        const headers = data.result.map(h => processHeader(h))
        const reorged = headers.filter((h,i) => {
            return !compareHeaders(localState[i], h)
        })
        if(reorged.length){
            console.log(`Header Sync <- Reorg detected. Resyncing ${reorged.length} blocks`)
            let minHeight = reorged.pop().height
            removeHeaders(minHeight)
            localState = getLocalState().map(h => processHeader(h))
        }
    } catch(e) {
        console.warn(e)
        throw(new Error("REORG_ERROR"))
    }
}

const compareHeaders = (a,b) => {
    const x = Buffer.concat([Buffer.from(a.height.toString(16), 'hex'), a.version, a.prev, a.root, a.time, a.bits, a.nonce, a.hash])
    const y = Buffer.concat([Buffer.from(b.height.toString(16), 'hex'), b.version, b.prev, b.root, b.time, b.bits, b.nonce, b.hash])
    return x.equals(y)
}

const syncFrom = async(height, limit = 10000) => {
    console.log(`Header Sync -> Syncing headers from block ${height}`)
    try {
        const { data } = await axios.get(`${peer}/${height}?limit=${limit}&order=asc&format=hex`)
        let bestHash = Buffer.from(localState[0].hash).reverse()
        const headers = data.result.map(h => {
            const header = processHeader(h)
            if(!header.prev.equals(bestHash)){
                throw new Error("Previous block hash mismatch")
            }
            bestHash = Buffer.from(header.hash).reverse()
            return header
        })
        insertHeaders(headers)
    } catch(e) {
        console.warn(e)
        throw(e)
    }
}

export { init }