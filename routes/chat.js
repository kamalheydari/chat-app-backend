const router = require("express").Router()

const authController = require("../controllers/authController")
const chatControllers = require("../controllers/chatControllers.js")

router.get("/all", authController.protect, chatControllers.allChats)
router.get("/:userId", authController.protect, chatControllers.accessChat)

module.exports = router
