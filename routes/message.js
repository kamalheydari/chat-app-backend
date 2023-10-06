const router = require("express").Router()

const authController = require("../controllers/authController")
const messageController = require("../controllers/messageControllers")

router.get("/:chatId", authController.protect, messageController.allMessages)
router.post("/", authController.protect, messageController.sendMessage)

module.exports = router
