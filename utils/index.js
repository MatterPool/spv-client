import { createHash } from 'crypto'

const sha256 = (data) => {
    let h = createHash('sha256').update(data) 
    return h.digest() 
}

const sha256d = (data) => {
    return sha256(sha256(data)) 
}

const processHeader = (header) => {
    const buf = (header.header) ? Buffer.from(header.header, 'hex') : Buffer.alloc(80) 
    const hash = header.height === -1 ? Buffer.alloc(32) : sha256d(buf).reverse() 
    return {
        height: header.height,
        hash,
        version: buf.slice(0, 4),
        prev: buf.slice(4, 36),
        root: buf.slice(36, 68),
        time: buf.slice(68, 72),
        bits: buf.slice(72, 76),
        nonce: buf.slice(76, 80)
    }
}

const sleep = (s) => {
  return new Promise(resolve => setTimeout(resolve, s*1000)) 
}

export {
    processHeader,
    sha256d,
    sleep
}