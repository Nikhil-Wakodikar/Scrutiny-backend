const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { scrutinyValidations } = require("../validations");
const { scrutinyController } = require("../controllers");

const router = express.Router();

router
  .route("/")
  .get(
    validate(scrutinyValidations.getScrutinys),
    scrutinyController.getScrutinys
  )
  .post(
    validate(scrutinyValidations.createScrutiny),
    scrutinyController.createScrutiny
  );

router
  .route("/abstract-report")
  .get(
    validate(scrutinyValidations.getAbstrctReport),
    scrutinyController.getAbstrctReport
  );

// Token authentication for all routes defined in this file
// router.use(auth.auth());

router
  .route("/:scrutinyId")
  .get(
    validate(scrutinyValidations.getScrutinyById),
    scrutinyController.getScrutiny
  )
  .put(
    validate(scrutinyValidations.updateScrutiny),
    scrutinyController.updateScrutiny
  )
  .delete(
    validate(scrutinyValidations.deleteScrutiny),
    scrutinyController.deleteScrutiny
  );

module.exports = router;
