import { db as sqlite } from './sqlite'

const config = {
    port: 3000,
    reorgThreshold: 50,
    db: sqlite,
    sleepInterval: 10,
    peer: "https://txdb.mattercloud.io/api/v1/blockheader",
    capabilities: {
        endpoint: '',
        shareHeaders: true,
        verification: true
    }
}

export { config }