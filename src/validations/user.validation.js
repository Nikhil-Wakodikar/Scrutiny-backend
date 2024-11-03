const Joi = require("joi");
const { password, objectId } = require("./custom.validation");

const createUser = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    givenName: Joi.string().required(),
    familyName: Joi.string().required(),
    // role: Joi.string().required().valid('user', 'admin'),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    givenName: Joi.string().required(),
    familyName: Joi.string().required(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      givenName: Joi.string().required(),
      familyName: Joi.string().required(),
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      bio: Joi.string(),
      gender: Joi.string().valid("Male", "Female"),
      dateOfBirth: Joi.date(),
      phone: Joi.string().min(12),
      profileImg: Joi.string(),
    })
    .min(1),
};

const updateOrg = {
  params: Joi.object().keys({
    orgId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      givenName: Joi.string().required(),
      familyName: Joi.string().required(),
    })
    .min(1),
};

const savePosts = {
  params: Joi.object().keys({
    postId: Joi.required().custom(objectId),
  }),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateScrutinySubmit = {};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  savePosts,
  deleteUser,
  updateScrutinySubmit,
};
