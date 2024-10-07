const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { cityValidations } = require("../validations");
const { cityController } = require("../controllers");

const router = express.Router();

router
  .route("/")
  .get(validate(cityValidations.getCities), cityController.getCities);

module.exports = router;
