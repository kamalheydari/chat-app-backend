const Message = require("../models/messageModel")
const User = require("../models/userModel")
const Chat = require("../models/chatModel")
const catchAsync = require("../utils/catchAsync")
const allowCors = require("../utils/allowCors")

//@description     Get all Messages
//@route           GET /Message/:chatId
//@access          Protected
exports.allMessages = catchAsync(
  allowCors(async (req, res, next) => {
    try {
      const messages = await Message.find({ chat: req.params.chatId }).populate("sender", "firstName lastName email").populate("chat")
      res.json({ data: { messages } })
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  })
)

//@description     Create New Message
//@route           POST /Message/
//@access          Protected
exports.sendMessage = catchAsync(
  allowCors(async (req, res, next) => {
    const { content, chatId } = req.body

    if (!content || !chatId) {
      console.log("Invalid data passed into request")
      return res.sendStatus(400)
    }

    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    }

    try {
      var message = await Message.create(newMessage)

      message = await message.populate("sender", "firstName lastName")
      message = await message.populate("chat")
      message = await User.populate(message, {
        path: "chat.users",
        select: "firstName lastName email",
      })

      await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })

      res.json({ data: { message } })
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  })
)
