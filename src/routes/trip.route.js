const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { tripValidations } = require("../validations");
const { tripController } = require("../controllers");

const router = express.Router();

// Token authentication for all routes defined in this file
router.use(auth.auth());

// Routes: create trip
router
  .route("/")
  .post(validate(tripValidations.createTrip), tripController.createTrip);

module.exports = router;
