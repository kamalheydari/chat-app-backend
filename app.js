const express = require("express") // web framework for Node.js.
const morgan = require("morgan") // HTTP request logger middleware for node.js

const routes = require("./routes/index")

const rateLimit = require("express-rate-limit") // Basic rate-limiting middleware for Express. Use to limit repeated requests to public APIs and/or endpoints such as password reset.
const helmet = require("helmet") // Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!

const mongosanitize = require("express-mongo-sanitize") // This module searches for any keys in objects that begin with a $ sign or contain a ., from req.body, req.query or req.params.

// By default, $ and . characters are removed completely from user-supplied input in the following places:
// - req.body
// - req.params
// - req.headers
// - req.query

const bodyParser = require("body-parser") // Node.js body parsing middleware.

// Parses incoming request bodies in a middleware before your handlers, available under the req.body property.

const cors = require("cors") // CORS is a node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
const cookieParser = require("cookie-parser") // Parse Cookie header and populate req.cookies with an object keyed by the cookie names.
const session = require("cookie-session") // Simple cookie-based session middleware.

const app = express()

// const allowedOrigins = ["http://localhost:5173", "https://chat-app-lake-six.vercel.app"]

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//         callback(null, true)
//       } else {
//         callback(new Error("Not allowed by CORS"))
//       }
//     },
//     credentials: true,
//     optionsSuccessStatus: 200,
//   })
// )

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

app.use(helmet())

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"))
}

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: "Too many Requests from this IP, please try again in an hour!",
})

app.use("/tawk", limiter)

app.use(
  express.urlencoded({
    extended: true,
  })
) // Returns middleware that only parses urlencoded bodies

app.use(mongosanitize())

app.get("/", (req, res) => res.json("hello"))
app.use(routes)

module.exports = app
