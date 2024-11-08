const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { votesAccountValidation } = require("../validations");
const { votesAccountController } = require("../controllers");
const { imgDataUpload, uploadVotersAccount } = require("../middlewares/multer");

const router = express.Router();

router
  .route("/create-votes-account")
  .post(
    [
      uploadVotersAccount.single("file"),
      votesAccountValidation.createVotesAccountWithoutAuth,
    ],
    votesAccountController.createVotesAccountWithoutAuth
  );

router.use(auth.auth());

router
  .route("/")
  .get(
    validate(votesAccountValidation.getVotesAccounts),
    votesAccountController.getVotesAccounts
  )
  .post(
    [
      uploadVotersAccount.single("file"),
      validate(votesAccountValidation.createVotesAccount),
    ],
    votesAccountController.createVotesAccount
  );

router
  .route("/get-data-by-image")
  .post(
    imgDataUpload.single("file"),
    votesAccountController.getVotesAccountByImg
  );

router
  .route("/:votesAccountId")
  .get(
    validate(votesAccountValidation.getVotesAccountById),
    votesAccountController.getVotesAccount
  )
  .put(
    validate(votesAccountValidation.updateVotesAccount),
    votesAccountController.updateVotesAccount
  );

module.exports = router;
