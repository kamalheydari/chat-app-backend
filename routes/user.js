const router = require("express").Router();

const userController = require("../controllers/userController");
const authController = require("../controllers/authController");

router.get("/get-me", authController.protect, userController.getMe);
router.get("/get-all-users", authController.protect, userController.getAllUsers)



module.exports = router;
