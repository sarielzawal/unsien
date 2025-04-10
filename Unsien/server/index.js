const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose"); // Interact with mongoDB server
const socket = require("socket.io");

const app = express();

require("dotenv").config(); // Loading enviroment variables
app.use(cors());
app.use(express.json());

const userRoutes = require("./routes/userRoutes");
const messageRoute = require("./routes/messagesRoute");
app.use("/api/auth", userRoutes);
app.use("/api/messages", messageRoute);

mongoose.connect(process.env.MONGO_URL, { 
}).then(()=> { console.log("DB Connected Successfully")}).catch((err)=> {
    console.log(err.message);
});
const server = app.listen(process.env.PORT, ()=> {
    console.log(`Server Started on Port ${process.env.PORT}`);
});
const io = socket(server, {
    cors:{
        origin:"http://localhost:3000",
        credentials: true,
    }
});


global.onlineUsers = new Map();

io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        console.log("send msg: (server)", data);
        const sendUserSocket = onlineUsers.get(data.to);
        // if user online
        if (sendUserSocket) {
            console.log("receive msg: (server)", data);
            socket.to(sendUserSocket).emit("msg-receive", data);
        }
    });
});
