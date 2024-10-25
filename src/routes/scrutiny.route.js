const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { scrutinyValidation } = require("../validations");
const { scrutinyController } = require("../controllers");
const { upload } = require("../middlewares/multer");

const router = express.Router();

router
  .route("/")
  .get(
    validate(scrutinyValidation.getScrutinys),
    scrutinyController.getScrutinys
  )
  .post(
    [upload.single("file"), validate(scrutinyValidation.createScrutiny)],
    scrutinyController.createScrutiny
  );

router
  .route("/abstract-report")
  .get(
    validate(scrutinyValidation.getAbstrctReport),
    scrutinyController.getAbstrctReport
  );

router
  .route("/get-data-by-image")
  .post(upload.single("file"), scrutinyController.getScrutinyDataByImg);

// Token authentication for all routes defined in this file
// router.use(auth.auth());

router
  .route("/:scrutinyId")
  .get(
    validate(scrutinyValidation.getScrutinyById),
    scrutinyController.getScrutiny
  )
  .put(
    validate(scrutinyValidation.updateScrutiny),
    scrutinyController.updateScrutiny
  )
  .delete(
    validate(scrutinyValidation.deleteScrutiny),
    scrutinyController.deleteScrutiny
  );

module.exports = router;
