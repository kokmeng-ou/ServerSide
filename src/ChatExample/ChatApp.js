import * as dotenv from 'dotenv'
import express from 'express'
const app = express();
import { createServer } from 'http';
const server = createServer(app);
import { Server } from "socket.io";
const io = new Server(server);
dotenv.config()

app.use(express.json())
app.use(express.urlencoded( { extended: false } ))
app.use(cors())

const rooms = {}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/:room', (req, res) => {
  res.sendFile(__dirname + '/room.html');
});

app.post('/room', (req, res) => {
  const message = { id: Date.now(), text: req.body.room };
  io.emit('room-created', message)
})

io.on('connection', (socket) => {
    socket.on('message', (room, msg) => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        const formattedTime = `${hours}:${minutes}:${seconds}`;
        const message = { id: Date.now(), text: msg, time: formattedTime };
        console.log(message)
        socket.to(room).broadcast.emit('message', message);
    });
    socket.on('join', (room ,username) => {
        const message = { id: Date.now(), text: `${ username } has join the server`};
        socket.to(room).broadcast.emit('message' , message)
    })
    socket.on('disconnect', (room) => {
        const message = { id: Date.now(), text: 'User disconnect from server'};
        socket.broadcast.emit('message' , message)
    });
});



server.listen(9000, () => {
  console.log('listening on *:8000');
});