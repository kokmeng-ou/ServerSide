import * as dotenv from 'dotenv'
import express from 'express'
import { createServer } from 'http';
import { Server } from "socket.io";
import cors from 'cors'
import mongoose from '../models/ConnectMongoose'
import login from '../routes/loginRouter'
import register from '../routes/registerRouter'
import content from '../routes/ContentRouter'
import profile from '../routes/profileRouter'
import comments from '../routes/commentRouter'
import Invitation from '../routes/Invitation'
import html from '../routes/htmlRouter'
// database saving for html and css 
import SavingHTML from '../models/html/Savinghtml'
import SavingCSS from '../models/css/SavingCSS'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded( { extended: false } ))
app.use(cors())
const server = createServer(app);
const io = new Server(server, {
    cors: { // important to let it work with vue 3 js 
        origin: '*',
        methods: ['GET', 'POST']
    }
});
mongoose // Connected to MongoDB inside models

//Add Router
// testing router => pass
app.get('/', (req, res) => res.send('Hello World!')),

// login router
app.use('/user/login' , login )

// register router
app.use('/user/register' , register )

// content router
app.use('/content' , content )

// profile router
app.use('/profile' , profile )

// comment router
app.use('/comment' , comments )

// comment router
app.use('/html' , html )

// comment router
app.use('/Invitation' , Invitation )


//Add Router

// socket.io
io.on('connection', (socket) => {
    // If you want to send a message to everyone except for a certain emitting socket, we have the broadcast flag for emitting from that socket
    // socket.broadcast.emit('hi');
    // Join a room
    socket.on('join-Room', (room) => {
        socket.join(room)
        console.log(`Client joined room: ${ room }`)
    })
    // Leave a room
    socket.on('Leave-Room', (room) => {
        socket.leave(room)
        console.log(`Client left room: ${ room }`)
    })
    socket.on('send-chat-message', (room, msg) => {
        io.to(room).emit('chat-message', msg)
    })
    socket.on('send-html', (room, html) => {
        io.to(room).emit('html-message', html)
    })
    socket.on('send-css', (room, css) => {
        const getCSS = css
        io.to(room).emit('css-message', css)
    })
    socket.on('rerun', (room, run) => {
        io.to(room).emit('rerun-message', run)
    })
    socket.on('disconnect', (room) => {
        const message = { id: Date.now(), text: 'User disconnect from server'};
        io.to(room).emit('chat-message' , message)
    })
})

// End Router
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`App listening on port ${port}!`))
