// src/server.js
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server);         // 👈 monta socket.io en el server

// que Express pueda acceder a io (req.app.get('io'))
app.set('io', io);

io.on('connection', (socket) => {
  console.log('🔌 conectado:', socket.id);
});

module.exports = server;
