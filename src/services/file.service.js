// const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
const config = require("../config/config");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const fs = require("fs");
const FormData = require("form-data");

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
    console.log(form);
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
    return imgData;
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

module.exports = { deleteLocal, save };
