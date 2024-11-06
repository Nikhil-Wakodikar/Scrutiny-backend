const moment = require("moment");
const httpStatus = require("http-status");
const config = require("../config/config");
const { Otp } = require("../models");
const ApiError = require("../utils/ApiError");
const { otpTypes } = require("../config/otp");

/**
 * Save a otp
 * @param {string} otp
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {boolean} [blacklisted]
 * @returns {Promise<Otp>}
 */
const saveOtp = async (otp, userId, type, expires, blacklisted = false) => {
  let body = {
    otp,
    user: userId,
    type: type,
    expires: expires.toDate(),
    blacklisted,
  };

  const otpDoc = await Otp.create({
    ...body,
  });
  return otpDoc;
};

/**
 * Verify otp and return otp doc (or throw an error if it is not valid)
 * @param {string} otp
 * @returns {Promise<Otp>}
 */
const verifyOtp = async (otp, type) => {
  const otpDoc = await Otp.findOne({
    otp,
    type,
    blacklisted: false,
  });
  if (!otpDoc) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }
  return otpDoc;
};

/**
 * Generate verify mobile number otp
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateLoginOtp = async (user) => {
  const expires = moment().add(
    config.jwt.verifyLoginExpirationMinutes,
    "minutes"
  );
  // generate 6 digit otp
  const loginOtp = Math.floor(100000 + Math.random() * 900000);
  let otp = await saveOtp(loginOtp, user.id, otpTypes.LOGIN, expires);
  // console.log("otp ====>", otp);
  return loginOtp;
};

/**
 * Remove user otp
 * @param {User} user
 * @returns {Promise<string>}
 */
const removeUserOtp = async (user, type) => {
  await Otp.deleteMany({ user: user._id, type: type });
  return "";
};

module.exports = { verifyOtp, generateLoginOtp, removeUserOtp };
