const express = require("express");
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const tripRoute = require("./trip.route");
const cityRoute = require("./cities.route");
const docsRoute = require("./docs.route");
const config = require("../config/config");

const router = express.Router();

// Routes index
const defaultRoutes = [
  {
    path: "/auth", // base path for auth routes
    route: authRoute,
  },
  {
    path: "/users", // base path for user routes
    route: userRoute,
  },
  {
    path: "/trip", //base path for trip routes
    route: tripRoute,
  },
  {
    path: "/city", //base path for cities route
    route: cityRoute,
  },
];

// Swagger documentation route available only in development mode
const devRoutes = [
  {
    path: "/docs",
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === "development") {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
