const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { tripValidations } = require("../validations");
const { tripController } = require("../controllers");

const router = express.Router();

router
  .route("/")
  .get(validate(tripValidations.getTrips), tripController.getTrips);

router
  .route("/:tripId")
  .get(validate(tripValidations.getTrip), tripController.getTrip);

// Token authentication for all routes defined in this file
router.use(auth.auth());

// Routes: create trip
router
  .route("/")
  .post(validate(tripValidations.createTrip), tripController.createTrip);

router
  .route("/:tripId")
  .put(validate(tripValidations.updateTrip), tripController.updateTrip)
  .delete(validate(tripValidations.deleteTrip), tripController.deleteTrip);

module.exports = router;
