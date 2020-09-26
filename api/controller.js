import * as config from "../config";
const { peer } = config;
import * as store  from "../utils/db";
import { SPV, SPVTx } from "spv";
import { processHeader } from '../utils';
import { BlockHeader } from "bsv";

const getStatus = (req, res) => {
    const header = store.getHeaders(null, 1, 'desc').map(h => processHeader(h));
    res.json({
        status: 200,
        errors: [ ],
        result: {
            height: header[0].height || -1,
            blockHash: header[0].hash.toString('hex') || null,
            updated: new Date().getTime()
        }
    });
}

const getHeaders = (req, res) => {
    const limit = req.query.limit ? Math.min(10000, Math.abs(parseInt(req.query.limit))) : 1;
    const order = req.query.order && req.query.order.match(/^(asc|0)$/i) !== null ? "asc" : "desc";
    const hash = req.params.hash || null;
    const headers = store.getHeaders(hash, limit, order).map(h => {
        return {
            height: h.height,
            hash: h.hash.toString('hex'),
            header: h.header.toString('hex')
        }
    });
    res.json({
        status: 200,
        errors: [ ],
        result: headers
    });
}

const verifyProof = (req, res) => {
    let hash, result;        
    try {
        let proof = req.body.spvtx || req.body.rawspv || req.params.proof || null;
        console.log(proof);
        if(proof===null){
            throw(new Error("SPV proof not defined"));
        } else {
            if(proof.slice(0,2)==="00"){
                proof=SPV.fromHex(proof);
                hash = proof.blockHash;
            } else {
                proof=SPVTx.fromHex(proof);
                hash = proof.spv.blockHash;
            }
            const rawheader = store.getHeaders(hash.toString('hex'), 1);
            if(!rawheader.length) throw new Error("Header not found")
            header = BlockHeader.fromBuffer(rawheader[0].header);
            result = proof.verify(header);
            res.json({
                status: 200,
                errors: [],
                result: result
            });
        }
    } catch(e) {
        res.status(500).json({
            status: 500,
            errors: [e.message],
            result: false
        });
    }
}

const getPeers = (req, res) => {
    res.json({
        peer
    });
}

export default {
    getStatus,
    getHeaders,
    getPeers,
    verifyProof
}