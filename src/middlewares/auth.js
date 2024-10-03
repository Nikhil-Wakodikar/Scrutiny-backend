const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
// const {
//   roleRights
// } = require('../config/roles');

const verifyCallback = (req, resolve, reject) => {
  return async (err, user, info) => {
    // console.log(err)
    // console.log(user)
    // console.log(info)
    if (err || info || !user) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    // Reject request if user was deleted
    if (user.deleted) {
      return reject(new ApiError(httpStatus.UNAUTHORIZED, 'User deleted'))
    }
    // console.log(user)
    req.user = user;

    // if (requiredRights.length) {
    //   const userRights = roleRights.get(user.role);
    //   const hasRequiredRights = requiredRights.every((requiredRight) => userRights.includes(requiredRight));
    //   if (!hasRequiredRights && req.params.userId !== user._id + "") {
    //     return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    //   }
    // }

    resolve();
  };
};

// Access token authentication middleware
const auth = (...requiredRights) => async (req, res, next) => {
  // console.log(req.headers)
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', {
      session: false
    }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
