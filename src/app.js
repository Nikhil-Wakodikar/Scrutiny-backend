const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const passport = require("passport");
const httpStatus = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { jwtStrategy } = require("./config/passport");
const { authLimiter } = require("./middlewares/rateLimiter");
const routes = require("./routes");
const { errorConverter, errorHandler } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");
const path = require("path");

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

app.use((req, res, next) => {
  console.log(req);
  next();
});

// Set necessary HTTP headers for app security
// app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "https: data:"],
    },
  })
);

// JSON requests are received as plain text. We need to parse the json request body.
app.use(express.json());

// Parse urlencoded request body if provided with any of the requests
app.use(express.urlencoded({ extended: true }));

// Using gzip compression for faster transfer of response data
app.use(compression());

// Enable cors to accept requests from any frontend domain, all possible HTTP methods, and necessary items in request headers
app.use(cors());
app.options("*", cors());

//static for image
//For sending files to client
const folderList = ["scrutiny", "votes-account"];

folderList.map((fname) => {
  app.use(
    `/assets/${fname}`,
    express.static(path.join(__dirname, `/assets/${fname}`))
  );
});

// Initialize jwt authentication
app.use(passport.initialize());

// Define jwt token authentication strategy
passport.use("jwt", jwtStrategy);

// Limit repeated failed requests to auth endpoints
if (config.env === "production") {
  app.use("/auth", authLimiter);
}

// Define routes index in separate file.
app.use("/", routes);

// Send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Convert error to ApiError, if request was rejected or it throws an error
app.use(errorConverter);

// Handle the error
app.use(errorHandler);

module.exports = app;
