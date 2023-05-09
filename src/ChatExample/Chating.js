import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server, { // important for working with vue 3 js 
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
dotenv.config()

app.use(express.json())
app.use(express.urlencoded( { extended: false } ))
app.use(cors())

const rooms = {}

app.post('/:room' , (req, res) => {
    rooms[req.params.room] = { users : {}}
})

io.on('connection', (socket) => {
    socket.username = ''
    socket.on('disconnect', () => {
      console.log('A user disconnected');
    });

    socket.on('chat-message', (room, msg) => {
      console.log(`Received message: ${msg}`);
      socket.to(room).broadcast.emit('chat-message', {user: rooms[room].socket.username , text: msg });
    });

    socket.on('new-join-chat', (room, name) => {
        socket.join(room)
        console.log(room)
        console.log(rooms)
        console.log(`user ${ name } connect`)
        if (socket.username != null) {
            socket.username = name
        }
        socket.to(room).broadcast.emit('chat-message', {user : socket.username })
    })
});

server.listen(9000, () => {
    console.log('listening on *:9000');
});