// src/server.js
import http from 'http'
import app from './app.js'
import { Server } from 'socket.io'

const server = http.createServer(app)
const io = new Server(server)      

app.set('io', io)

io.on('connection', (socket) => {
  console.log('conectado:', socket.id)
})

export default server
