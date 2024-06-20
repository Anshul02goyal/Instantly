const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages")
const socket = require("socket.io");

dotenv.config();
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("DB connection successfull");
}).catch((err) => {
    console.log(err.message)
})

app.get("/ping", (_req, res) => {
    return res.json({ msg: "Ping Successful" });
});


const server = app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
})

const io = socket(server, {
    cors: {
        origin: "https://anshul-instantly.netlify.app",
        credentials: true,
    },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
        onlineUsers.set(userId, socket.id);
    });

    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.to);
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-recieve", data.msg);
        }
    });
});