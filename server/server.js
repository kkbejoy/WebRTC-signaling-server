const express = require("express");
const app = express();

const { Server } = require("socket.io");
const io = new Server(5000, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmail = new Map();

io.on("connection", (socket) => {
  socket.on("room:join", (data) => {
    console.log("Data", data);
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmail.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });
});
// app.listen(3000, () => {
//   console.log("Application running on port 3000");
// });
