const { Storage } = require("@google-cloud/storage");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const fs = require("fs");

const storage = new Storage({
  keyFilename: "src/qualified-cacao-317706-a7b4bc79c1c5.json",
});

const bucketName = "image_bucket_tempp";
const bucket = storage.bucket(bucketName);

// Sending the upload request
const upload = async (file) => {
  let url;
  bucket.upload(
    file.path,
    {
      destination: `${file.filename}`,
    },
    function (err, file) {
      if (err) {
        console.error(`Error uploading image image_to_upload.jpeg: ${err}`);
        throw new ApiError(
          httpStatus.SERVICE_UNAVAILABLE,
          "something went wrong"
        );
      } else {
        console.log(`Image image_to_upload.jpeg uploaded to ${bucketName}.`);
      }
    }
  );
  url = `${config.storageServiceProvider}/${bucketName}/${file.filename}`;
  return url;
};

/**
 * Delete local file
 * @param {string} path
 * @returns {Promise}
 */
const deleteLocal = async (path) => {
  fs.unlinkSync(path);
  return;
};

module.exports = { upload, deleteLocal };
