import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from '../../models/ConnectMongoose'
import register from '../../routes/RegisterRouter'
import login from '../../routes/LoginRouter'
import content from '../../routes/ContentRouter'
import comment from '../../routes/commentRouter'
import profile from '../../routes/ProfileRouter'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded( { extended: false } ))
app.use(cors())
mongoose // Connected to MongoDB inside models

// Testing get Server
app.get('/', (req, res) => res.send('Hello World!'))

// Add Router
// register router
app.use('/user' , register )
// Login router
app.use('/user' , login )
// profile router
app.use('/user' , profile)
// content router
app.use('/post', content )
// comment router
app.use('/comment', comment )

// End Router

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Client app listening on port ${port}!`))
