const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

let fileName = "";
//set destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "temp");
  },
  filename: (req, file, cb) => {
    fileName = file.originalname;
    req.body["file"] = fileName;
    cb(null, fileName);
  },
});
//upload file
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    try {
      let ExtArr = ["image/jpeg", "image/jpg", "image/png"];
      if (ExtArr.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    } catch (err) {
      throw new ApiError(
        httpStatus.NOT_MODIFIED,
        "Profile Picture not uploded"
      );
    }
  },
});

//set destination
const storage2 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../assets/storyIMG"));
  },
  filename: (req, file, cb) => {
    fileName = Date.now() + file.originalname;
    req.body["storyImg"] = fileName;
    cb(null, fileName);
  },
});

//upload file
const upload2 = multer({
  storage: storage2,
  fileFilter: (req, file, cb) => {
    try {
      let ExtArr = ["image/jpeg", "image/jpg", "image/png"];
      if (ExtArr.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    } catch (err) {
      throw new ApiError(
        httpStatus.NOT_MODIFIED,
        "Profile Picture not uploded"
      );
    }
  },
});

module.exports = { upload, upload2 };
