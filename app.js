const express = require("express") // web framework for Node.js.
const morgan = require("morgan") // HTTP request logger middleware for node.js

const routes = require("./routes/index")

const mongosanitize = require("express-mongo-sanitize")

const bodyParser = require("body-parser") // Node.js body parsing middleware.

// Parses incoming request bodies in a middleware before your handlers, available under the req.body property.

const cookieParser = require("cookie-parser") // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
const session = require("cookie-session") // Simple cookie-based session middleware.

const app = express()

app.use(cookieParser())

// Setup express response and body parser configurations
app.use(express.json({ limit: "10kb" })) // Controls the maximum request body size. If this is a number, then the value specifies the number of bytes; if it is a string, the value is passed to the bytes library for parsing. Defaults to '100kb'.
app.use(bodyParser.json()) // Returns middleware that only parses json
app.use(bodyParser.urlencoded({ extended: true })) // Returns middleware that only parses urlencoded bodies

app.use(
  session({
    secret: "keyboard cat",
    proxy: true,
    resave: true,
    saveUnintialized: true,
    cookie: {
      secure: false,
    },
  })
)

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

app.use(
  express.urlencoded({
    extended: true,
  })
) // Returns middleware that only parses urlencoded bodies

app.use(mongosanitize())

app.use(routes)
app.get("/", (req, res) => res.json("hello"))

module.exports = app
