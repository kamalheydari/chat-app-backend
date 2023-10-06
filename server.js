const mongoose = require("mongoose")
const { Server } = require("socket.io")


process.on("uncaughtException", (err) => {
  console.log(err)
  console.log("UNCAUGHT Exception! Shutting down ...")
  process.exit(1) // Exit Code 1 indicates that a container shut down, either because of an application failure.
})

const app = require("./app")

const http = require("http")
const server = http.createServer(app)

const DB = process.env.DATABASE_URI

mongoose.connect(DB, {}).then((con) => {
  console.log("DB Connection successful")
})

const port = process.env.PORT || 8000

const io = new Server(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

server.listen(port, () => {
  console.log(`App running on port ${port} ...`)
})

io.on("connection", async (socket) => {
  console.log("connected to socket.io")

  socket.on("setup", (userData) => {
    socket.join(userData._id)
    socket.emit("connected")
  })

  socket.on("join chat", (room) => {
    socket.join(room)
    console.log("user joined room : " + room)
  })

  socket.on("new message", (newMessage) => {
    const chat = newMessage.chat
    if (!chat.users) return console.log("chat.users not defined")
    chat.users.forEach((user) => {
      socket.in(user._id).emit("massage recieved", newMessage)
    })
  })
})

process.on("unhandledRejection", (err) => {
  console.log(err)
  console.log("UNHANDLED REJECTION! Shutting down ...")
  server.close(() => {
    process.exit(1) //  Exit Code 1 indicates that a container shut down, either because of an application failure.
  })
})
