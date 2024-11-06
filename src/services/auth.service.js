const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const otpService = require("./otp.service");
const Token = require("../models/token.model");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const { otpTypes } = require("../config/otp");

/**
 * Login with username and password
 * @param {string} dialCode
 * @param {string} phone
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithMobileNumberAndPassword = async (
  dialCode,
  phone,
  password
) => {
  const user = await userService.getUserByMobileNumber(dialCode, phone);
  if (!user || user.deleted || !(await user.isPasswordMatch(password))) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Incorrect mobile number or password"
    );
  }
  return await user.populate("givenName mobileNumber");
};

/**
 * Login with username and otp
 * @param {string} dialCode
 * @param {string} phone
 * @param {string} otp
 * @returns {Promise<User>}
 */
const loginUserWithMobileNumberAndOtp = async (dialCode, phone, otp) => {
  const user = await userService.getUserByMobileNumber(dialCode, phone);
  if (!user || user.deleted) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Incorrect mobile number or password"
    );
  }

  const verifyOtp = await otpService.verifyOtp(otp, otpTypes.LOGIN);
  // to be completed

  return await user.populate("givenName mobileNumber");
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updateUserById(user.id, { password: newPassword });
    await Token.deleteMany({ user: user.id, type: tokenTypes.RESET_PASSWORD });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({ user: user.id, type: tokenTypes.VERIFY_EMAIL });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

module.exports = {
  loginUserWithMobileNumberAndPassword,
  resetPassword,
  verifyEmail,
};
