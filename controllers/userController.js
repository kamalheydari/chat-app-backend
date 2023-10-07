const User = require("../models/userModel")
const catchAsync = require("../utils/catchAsync")
const allowCors = require("../utils/allowCors")

//@description     Get authenticated user
//@route           GET /user
//@access          Protected
exports.getMe = catchAsync(
  allowCors(async (req, res, next) => {
    res.status(200).json({
      status: "success",
      data: { user: req.user },
    })
  })
)

//@description     Get or Search all users
//@route           GET /user?search=
//@access          Public
exports.getAllUsers = catchAsync(
  allowCors(async (req, res, next) => {
    const keyword = req.query.search
      ? {
          $or: [{ firstName: { $regex: new RegExp(req.query.search, "i") } }, { lastName: { $regex: new RegExp(req.query.search, "i") } }],
        }
      : {}

    const excludeMe = { _id: { $ne: req.user._id } }

    const users = await User.find({ ...keyword, ...excludeMe })
    res.status(200).json({
      status: "success",
      data: { users },
    })
  })
)
