const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
// const { tripValidations } = require("../validations");
const { scrutinyController } = require("../controllers");

const router = express.Router();

router.route("/").get(scrutinyController.getScrutinys);

router.route("/:scrutinyId").get(scrutinyController.getScrutiny);

// Token authentication for all routes defined in this file
// router.use(auth.auth());

// Routes: create trip
router.route("/").post(scrutinyController.createScrutiny);

router
  .route("/:tripId")
  .put(scrutinyController.updateScrutiny)
  .delete(scrutinyController.deleteScrutiny);

module.exports = router;
