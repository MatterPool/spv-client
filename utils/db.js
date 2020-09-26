import { config } from '../config'
import sqlite3 from 'better-sqlite3'
import { BlockHeader } from 'bsv'
const { reorgThreshold } = config 

const db = new sqlite3(config.db.path, {}, (e) => {
    if (e) {
      console.error(e.message)
      throw(e)
    }
})

const getLocalState = () => {
    try {
        const headerState = getHeaders(null, reorgThreshold, 'desc')
        if(!headerState.length){
            return [{
                height: -1,
                header: Buffer.alloc(80)
            }]
        }
        return headerState
    } catch(e) {
        return []
    }
}

const updateHeaders = (headers) => {
    const query = db.prepare(`UPDATE headers SET version = ?, hash = ?, root = ?, time = ?, bits = ?, nonce = ? WHERE height = ?`)
    headers.forEach(h => { 
        query.run(h.version, h.hash, h.root, h.time, h.bits, h.nonce, h.height)
    })
}

const removeHeaders = (height) => {
    height = parseInt(height)
    const query = db.prepare(`DELETE FROM headers WHERE height >= ?`)
    query.run(height)
}

const insertHeaders = (headers) => {
    const query = db.prepare(`INSERT INTO headers (height, version, hash, root, time, bits, nonce) VALUES (?,?,?,?,?,?,?)`)
    headers.forEach(h => { 
        query.run(h.height, h.version, h.hash, h.root, h.time, h.bits, h.nonce)
    })
}

const getHeaders = (block, limit=1, order='DESC') => {
    let type, headerRow
    if(block===null){
        type=null
    } else {
        if(Buffer.isBuffer(block) && block.length === 32){
            type = "hash"
        } else if(typeof block === 'string' && block.match(/^[a-f\d]{64}$/i)!==null){
            type = "hash"
            block = Buffer.from(block, 'hex')
        } else if(typeof block === 'string' && block.match(/^\d+$/)!==null) {
            type = "height"
            block = Math.abs(parseInt(block))
        } else {
            throw new Error("Invalid block hash or height")
        }
    }

    limit = Math.min(10000, Math.abs(parseInt(limit))) 
    order = order.match(/^(asc)$/i) !== null ? 'ASC' : 'DESC' 

    let query = `SELECT a.*,
    coalesce(b.hash, x'0000000000000000000000000000000000000000000000000000000000000000') AS prev
    FROM headers AS a
    LEFT JOIN headers AS b on b.height = a.height-1 ` 
    if(block===null){
        query+=`ORDER BY height ${order} LIMIT ${limit};`
    } else {
        query+=`WHERE a.${type} ` 
        if(type==="hash" || limit===1){
            query+=` = ?;`
        } else {
            if(order==='DESC') {
                query+=`<= ? ORDER BY height DESC `
            } else {
                query+=`>= ? ORDER BY height ASC `
            }
            query+=` LIMIT ${limit};`
        }
    }
    const headerQuery = db.prepare(query) 
    if(block===null){
        headerRow = headerQuery.all() 
    } else {
        headerRow = headerQuery.all(block) 
    }
    if(!headerRow) throw new Error("Block header not found") 
    const headers = headerRow.map(h => {
        return { 
            height: h.height,
            hash: h.hash,
            header: Buffer.concat([h.version, h.prev.reverse(), h.root, h.time, h.bits, h.nonce])
        } 
    }) 
    return headers 
}

const initDb = () => {
    return new Promise((resolve, reject) => {
      try {
        db.exec(`CREATE TABLE IF NOT EXISTS headers (
          height INTEGER PRIMARY KEY NOT NULL, 
          version BLOB (4) NOT NULL, 
          hash BLOB (32) UNIQUE NOT NULL, 
          root BLOB (32) NOT NULL, 
          time BLOB (4) NOT NULL, 
          bits BLOB (4) NOT NULL, 
          nonce BLOB (4) NOT NULL
        );`) 
        resolve() 
      } catch(e){
        reject(e) 
      }
    }) 
}

export {
    initDb,
    getLocalState,
    getHeaders,
    insertHeaders,
    removeHeaders,
    updateHeaders
}