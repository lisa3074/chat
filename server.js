const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMsg = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const chatBot = "ChatBot";

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//Set static folder

app.use(express.static(path.join(__dirname, "public")));

//Run when client connects

io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    // here "message" is the key and "welcome to live chat" is the message sent, when asking for the jey in main.js
    //This only emits to the user
    //we are calling formatMsg from messeges.js to format the inputs we are given.
    socket.emit("message", formatMsg(chatBot, "Welcome to live chat"));

    //Broadcast when a user connects
    //This emits to all users except the one logging in
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMsg(chatBot, `${user.username} has joined the chat`)
      );

    //send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
    //run when client disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);
      if (user) {
        //This emits to all users
        io.to(user.room).emit(
          "message",
          formatMsg(chatBot, `${user.username} has left the chat`)
        );
        //send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });

  //Listen for chatmessages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMsg(user.username, msg));
  });
});
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
