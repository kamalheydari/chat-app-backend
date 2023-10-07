const Chat = require("../models/chatModel")
const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")

exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.params

  if (!userId) {
    console.log("UserId param not sent with request")
    return res.sendStatus(400)
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
  })
    .populate("users", "-password")
    .populate("latestMessage")

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "firstName lastName email",
  })

  if (isChat.length > 0) {
    res.json({
      data: isChat[0],
    })
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    }

    try {
      const createdChat = await Chat.create(chatData)
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")
      res.status(200).json({ data: FullChat })
    } catch (error) {
      res.status(400)
      throw new Error(error.message)
    }
  }
})

//@description     Fetch all chats for a user
//@route           GET /chat/all-chats
//@access          Protected
exports.allChats = catchAsync(async (req, res, next) => {
  try {
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "firstName lastName email",
        })
        res.status(200).json({
          data: {
            chats: results,
            userId: req.user._id,
          },
        })
      })
  } catch (error) {
    res.status(400)
    throw new Error(error.message)
  }
})
