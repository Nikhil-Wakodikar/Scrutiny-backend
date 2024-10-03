const httpStatus = require("http-status");
const { Blog } = require("../models");
const ApiError = require("../utils/ApiError");

/**
 * Create a blog
 * @param {Object} blogBody
 * @returns {Promise<Blob>}
 */
const createBlog = async (blogBody) => {
  return Blog.create(blogBody);
};

/**
 * Query for blog
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryBlogs = async (filter, options) => {
  const blogs = await Blog.paginate(filter, options);
  return blogs;
};

/**
 * Get blog by blogId
 * @param {ObjectId} blogId
 * @returns {Promise<Blog>}
 */
const getBlogById = async (blogId) => {
  return Blog.findById(blogId);
};

/**
 * Update blog by blogId
 * @param {ObjectId} blogId
 * @param {Object} updateBody
 * @returns {Promise<Blog>}
 */

const updateBlogById = async (blogId, updateBody) => {
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Blog not found");
  }
  Object.assign(blog, updateBody);
  await blog.save();
  return blog;
};

/**
 * Delete blog by blogId
 * @param {ObjectId} blogId
 * @returns {Promise<Blog>}
 */
const deleteBlogById = async (blogId) => {
  const blog = await getBlogById(blogId);
  if (!blog) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Blog not found");
  }
  await Blog.deleteOne({
    _id: blog._id,
  });
  return blog ? true : false;
};

module.exports = {
  createBlog,
  queryBlogs,
  getBlogById,
  updateBlogById,
  deleteBlogById,
};
