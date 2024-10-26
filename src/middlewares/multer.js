const multer = require("multer");
const path = require("path");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

let fileName = "";
//set destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("src/assets/scrutiny"));
  },
  filename: (req, file, cb) => {
    fileName = Date.now() + "." + file.originalname.split(".").pop();
    req.body["file"] = fileName;
    cb(null, fileName);
  },
});
//upload file
const uploadScrutiny = multer({
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
        "Error while uploading file!"
      );
    }
  },
});

//set destination
const storageVotersAccount = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("src/assets/votes-account"));
  },
  filename: (req, file, cb) => {
    fileName = Date.now() + "." + file.originalname.split(".").pop();
    req.body["file"] = fileName;
    cb(null, fileName);
  },
});
//upload file
const uploadVotersAccount = multer({
  storage: storageVotersAccount,
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
        "Error while uploading file!"
      );
    }
  },
});

const imgDataStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join("temp"));
  },
  filename: (req, file, cb) => {
    fileName = Date.now() + "." + file.originalname.split(".").pop();
    req.body["file"] = fileName;
    cb(null, fileName);
  },
});

const imgDataUpload = multer({
  storage: imgDataStorage,
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
        "Error while uploading file!"
      );
    }
  },
});

module.exports = { uploadScrutiny, imgDataUpload, uploadVotersAccount };
