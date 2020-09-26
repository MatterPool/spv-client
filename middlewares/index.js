import { config } from "../config"
const  { capabilities } = config

const peersMiddleware = (req, res, next) => {
    if (!capabilities.sharePeers) {
        res.status(500).send({
            error: "Peer sharing is disabled for this client."
        })
    }
    next()
}

const headerMiddleware = (req, res, next) => {
    if (!capabilities.shareHeaders) {
        res.status(500).send({
            error: "Header sharing is disabled for this client."
        })
    }
    next()
}

const verificationMiddleware = (req, res, next) => {
    if (!capabilities.verification) {
        res.status(500).send({
            error: "Verification is disabled for this client."
        })
    }
    next()
}

export {
    peersMiddleware,
    headerMiddleware,
    verificationMiddleware
}