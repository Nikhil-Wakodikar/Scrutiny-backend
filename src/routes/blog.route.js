const express = require("express");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { upload } = require("../middlewares/multer");
const { blogController } = require("../controllers");
const { blogValidation } = require("../validations");

const router = express.Router();

router
  .route("/")
  .get(validate(blogValidation.getBlogs), blogController.getBlogs);

router
  .route("/:blogId")
  .get(validate(blogValidation.getBlog), blogController.getBlog);

// Token authentication for all routes defined in this file
router.use(auth());

// Routes: get users, create user
router
  .route("/")
  .post(
    [upload.single("photo"), validate(blogValidation.createBlog)],
    blogController.createBlog
  );

router
  .route("/:blogId")
  .put(validate(blogValidation.updateBlogById), blogController.updateBlogById)
  .delete(
    validate(blogValidation.deleteBlogById),
    blogController.deleteBlogById
  );

module.exports = router;
