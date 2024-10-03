const Joi = require("joi");
const { objectId } = require("./custom.validation");
const { catagery } = require("../config/blog");

const createBlog = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    content: Joi.string().required(),
    photo: Joi.string(),
    info: Joi.string().required(),
    subTitle: Joi.string().required(),
    servings: Joi.string().required(),
    videoLink: Joi.string().required(),
    catagery: Joi.string()
      .required()
      .allow(...catagery),
    prepTime: Joi.string().required(),
    cookTime: Joi.string().required(),
  }),
};

const getBlogs = {
  query: Joi.object().keys({
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    search: Joi.string(),
    catagery: Joi.string().allow(...catagery),
  }),
};

const getBlog = {
  params: Joi.object().keys({
    blogId: Joi.string().custom(objectId),
  }),
};

const updateBlogById = {
  params: Joi.object().keys({
    blogId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    content: Joi.string(),
    info: Joi.string(),
    subTitle: Joi.string(),
    servings: Joi.string(),
    videoLink: Joi.string(),
    catagery: Joi.string().allow(...catagery),
    prepTime: Joi.string(),
    cookTime: Joi.string(),
  }),
};

const deleteBlogById = {
  params: Joi.object().keys({
    blogId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlogById,
  deleteBlogById,
};
