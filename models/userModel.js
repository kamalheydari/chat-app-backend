const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First Name is required"],
    },
    lastName: {
      type: String,
      required: [true, "Last Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: {
        validator: function (email) {
          return String(email)
            .toLowerCase()
            .match(
              /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            )
        },
        message: (props) => `Email (${props.value}) is invalid!`,
      },
    },
    password: {
      required: true,
      type: String,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestaps: true }
)

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password") || !this.password) return next()

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  next()
})

const User = new mongoose.model("User", userSchema)
module.exports = User
