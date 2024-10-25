const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { votesAccountValidation } = require("../validations");
const { votesAccountController } = require("../controllers");
const { upload } = require("../middlewares/multer");

const router = express.Router();

router
  .route("/")
  .get(
    validate(votesAccountValidation.getVotesAccounts),
    votesAccountController.getVotesAccounts
  )
  .post(
    validate(votesAccountValidation.createVotesAccount),
    votesAccountController.createVotesAccount
  );

router
  .route("/get-data-by-image")
  .post(upload.single("file"), votesAccountController.getVotesAccountByImg);

router
  .route("/:votesAccountId")
  .get(
    validate(votesAccountValidation.getVotesAccountById),
    votesAccountController.getVotesAccount
  );

module.exports = router;
