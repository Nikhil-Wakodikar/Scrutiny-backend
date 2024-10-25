// const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const fs = require("fs");
const FormData = require("form-data");
// const { Storage } = require("@google-cloud/storage");

// const storage = new Storage({
//   projectId: "qualified-cacao-317706",
//   keyFilename: "src/qualified-cacao-317706-1c7ed8448725.json",
// });

// const bucketName = "image_bucket_tempp";
// const bucket = storage.bucket(bucketName);

// // Sending the upload request
// const upload = async (file) => {
//   let url;
//   let res = await bucket.upload(
//     file.path,
//     {
//       destination: `prashasan/${file.filename}`,
//     },
//     function (err, file) {
//       if (err) {
//         console.error(`Error uploading image image_to_upload.jpeg: ${err}`);
//         throw new ApiError(
//           httpStatus.SERVICE_UNAVAILABLE,
//           "something went wrong"
//         );
//       } else {
//         console.log(`Image uploaded to ${bucketName}/prashasan.`);
//       }
//       const directory = "temp";
//       const fileToKeep = ".gitkeep";
//       fs.readdir(directory, (err, files) => {
//         if (err) throw err;
//         const filesToDelete = files.filter((file) => file !== fileToKeep);
//         for (const file of filesToDelete) {
//           fs.unlinkSync(`${directory}/${file}`, (err) => {
//             if (err) throw err;
//           });
//         }
//       });
//     }
//   );
//   url = `${config.storageServiceProvider}/${bucketName}/prashasan/${file.filename}`;
//   return url;
// };

/**
 * Save a file
 * @param {string} file
 * @param {string} name
 * @returns {Promise}
 */
const save = async (file) => {
  try {
    let form = new FormData();
    form.append("file", fs.createReadStream(file.path));
    // console.log(form);
    const upload = await axios({
      method: "post",
      url: `${config.dataExtrationServiceProvider}/upload`,
      data: form,
      headers: {
        "content-type": "maltipart/form-data",
      },
    });
    let imgData = { ...upload.data.data };
    // console.log(imgData);
    await deleteLocal(file.path);
    return upload.data;
  } catch (error) {
    console.log("error ==>", error.code);
    // empty temp except .gitkeep
    const directory = "temp";
    const fileToKeep = ".gitkeep";
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
      const filesToDelete = files.filter((file) => file !== fileToKeep);
      for (const file of filesToDelete) {
        fs.unlinkSync(`${directory}/${file}`, (err) => {
          if (err) throw err;
        });
      }
    });
    return error;
  }
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

module.exports = { deleteLocal, save, uploadFile };

const path = require("path");

async function uploadFile(file) {
  const ACCESS_TOKEN = config.storageAccess;
  const BUCKET_NAME = "image_bucket_tempp";
  const FILE_PATH = file.path;
  const DESTINATION_NAME = `prashasan/${file.filename}`;

  const url = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET_NAME}/o?uploadType=media&name=${DESTINATION_NAME}`;

  const fileData = fs.readFileSync(FILE_PATH);

  try {
    const response = await axios.post(url, fileData, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
    });

    console.log(`File uploaded: ${response.data.selfLink}`);
    await deleteLocal(file.path);
    return response.data.selfLink;
  } catch (error) {
    console.error("Error uploading file:", error.response.data);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Bucket upload failed"
    );
  }
}

// uploadFile();
