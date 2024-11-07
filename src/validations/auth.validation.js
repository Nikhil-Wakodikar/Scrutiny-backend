const Joi = require("joi");
const { password } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    givenName: Joi.string().required(),
    mobileNumber: Joi.object().keys({
      dialCode: Joi.string().min(2).max(4).required(),
      phone: Joi.string().length(10).required(),
    }),
    password: Joi.string(),
    type: Joi.string(),
    nameOfConstituency: Joi.string(),
    constituencyNumber: Joi.number(),
    numberOfPollingStation: Joi.number(),
    password: Joi.string(),
  }),
};

const login = {
  body: Joi.object()
    .keys({
      mobileNumber: Joi.object()
        .keys({
          dialCode: Joi.string().min(2).max(4).required(),
          phone: Joi.string().length(10).required(),
        })
        .required(),
      password: Joi.string(),
      otp: Joi.string().length(6),
    })
    .min(2),
};

const sendLoginOtp = {
  body: Joi.object().keys({
    mobileNumber: Joi.object()
      .keys({
        dialCode: Joi.string().min(2).max(4).required(),
        phone: Joi.string().length(10).required(),
      })
      .required(),
  }),
};

const logout = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  query: Joi.object().keys({
    token: Joi.string(),
  }),
  body: Joi.object().keys({
    password: Joi.string().required().custom(password),
  }),
};

const verifyEmail = {
  query: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendLoginOtp,
};
