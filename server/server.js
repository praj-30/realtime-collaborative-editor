const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const defaultValue = "";

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('get-document', documentId => {
    socket.join(documentId);
    socket.emit('load-document', defaultValue);

    socket.on('send-changes', delta => {
      socket.broadcast.to(documentId).emit('receive-changes', delta);
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = 4000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
