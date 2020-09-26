import { config } from './config' 
import { router as api } from './api' 
import express from 'express' 
import bodyParser from 'body-parser'
import { initDb } from "./utils/db" 
import { init as headerSync } from './services/header' 
const { port } = config
const app = express() 

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/api/v1/', api) 

const init = async() => {
    try {
        console.log("Intialising DB") 
        await initDb() 
        app.listen(port, () => {
            console.log(`SPV Client listening on port ${port}`) 
            headerSync() 
        }) 
    } catch(e) {
        console.error(e) 
        sleep(5) 
        init() 
    }
}

//Start DB and server
init() 