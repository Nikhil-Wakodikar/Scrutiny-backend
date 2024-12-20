const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const {
  authService,
  userService,
  tokenService,
  otpService,
  SMSService,
} = require("../services");

const register = catchAsync(async (req, res) => {
  let user;
  try {
    user = await userService.createUser(req.body);
  } catch (e) {
    // await org.remove();
    throw e;
  }
  user = await user.populate("givenName mobileNumber");
  res.status(httpStatus.CREATED).send({
    user,
  });
});

const login = catchAsync(async (req, res) => {
  let user;
  if (req.body.password) {
    const { mobileNumber, password } = req.body;
    user = await authService.loginUserWithMobileNumberAndPassword(
      mobileNumber.dialCode,
      mobileNumber.phone,
      password
    );
  } else if (req.body.otp) {
    const { mobileNumber, otp } = req.body;

    user = await authService.loginUserWithMobileNumberAndOtp(
      mobileNumber.dialCode,
      mobileNumber.phone,
      otp
    );
  }

  const { token, expires } = await tokenService.generateAuthTokens(user);
  res.send({
    user,
    token,
    expires,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  // await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendLoginOtp = catchAsync(async (req, res) => {
  const { mobileNumber } = req.body;
  const user = await userService.getUserByMobileNumber(
    mobileNumber.dialCode,
    mobileNumber.phone
  );
  if (!user) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found with this mobile number"
    );
  }
  const loginOtp = await otpService.generateLoginOtp(user);

  let mob = user.mobileNumber.dialCode + user.mobileNumber.phone;
  let data = {
    message: loginOtp,
    mobileNumber: user.mobileNumber.phone,
  };
  console.log(data);
  await SMSService.sendSMS({ ...data });

  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(
    req.user
  );
  // await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

const self = catchAsync(async (req, res) => {
  res.send(req.user);
});

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  self,
  sendLoginOtp,
};
