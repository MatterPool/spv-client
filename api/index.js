import * as express from 'express'
import controller from './controller'
import { peersMiddleware, headerMiddleware, verificationMiddleware } from '../middlewares'
const router = express.Router()

router.get('/status', controller.getStatus)
router.get('/header', headerMiddleware, controller.getHeaders)
router.get('/header/:hash', headerMiddleware, controller.getHeaders)
router.get('/peers', peersMiddleware, controller.getPeers)
router.post('/verify', verificationMiddleware, controller.verifyProof)
router.get('/verify/:proof', verificationMiddleware, controller.verifyProof)

export { router }