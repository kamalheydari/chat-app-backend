const jwt = require("jsonwebtoken")
const filterObj = require("../utils/filterObj")
const User = require("../models/userModel")
const { promisify } = require("util")
const catchAsync = require("../utils/catchAsync")

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  })

// Cookie options
const tokenCookieOptions = {
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: true,
  domain: process.env.DOMIN, 
  path: "/",
}

//@description     Register new user
//@route           POST /auth/register
//@access          Public
exports.register = catchAsync(async (req, res, next) => {
  try {
    const { email } = req.body

    const filteredBody = filterObj(req.body, "firstName", "lastName", "email", "password")

    // check if a verified user with given email exists
    const existing_user = await User.findOne({ email: email })

    if (existing_user) {
      // user with this email already exists, Please login
      return res.status(400).json({
        status: "error",
        message: "Email already in use, Please login.",
      })
    } else {
      // if user is not created before than create a new one
      const new_user = await User.create(filteredBody)

      req.userId = new_user._id

      const token = signToken(new_user._id)

      res.cookie("token", token, tokenCookieOptions)
      res.cookie("logged_in", true, {
        ...tokenCookieOptions,
        httpOnly: false,
      })

      res.status(201).json({
        status: "success",
        message: "User created successfully.",
      })
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    })
  }
})

//@description     Auth the user
//@route           POST /auth/login
//@access          Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required",
    })
    return
  }

  const user = await User.findOne({ email: email }).select("+password")

  if (!user || !user.password) {
    res.status(400).json({
      status: "error",
      message: "Incorrect password",
    })

    return
  }

  if (!user) {
    res.status(400).json({
      status: "error",
      message: "Email or password is incorrect",
    })

    return
  }

  req.userId = user._id

  const token = signToken(user._id)

  res.cookie("token", token, tokenCookieOptions)
  res.cookie("logged_in", true, {
    ...tokenCookieOptions,
    httpOnly: false,
  })

  res.status(200).json({
    status: "success",
    message: "Logged in successfully!",
  })
})

//@description     Logout the user
//@route           GET /auth/login
//@access          Public
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("token", "", { maxAge: 1 })
  res.cookie("logged_in", "", { maxAge: 1 })

  res.status(200).json({
    status: "success",
    message: "Logout is successfully!",
  })
})

// Protect
exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check if it's there
  let token
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  } else if (req.cookies.token) {
    token = req.cookies.token
  }

  if (!token) {
    return res.status(401).json({
      message: "You are not logged in! Please log in to get access.",
    })
  }
  // 2) Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) Check if user still exists

  const this_user = await User.findById(decoded.userId)
  if (!this_user) {
    return res.status(401).json({
      message: "The user belonging to this token does no longer exists.",
    })
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = this_user
  next()
})
