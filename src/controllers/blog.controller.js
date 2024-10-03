const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { blogService, fileService } = require("../services");

const createBlog = catchAsync(async (req, res) => {
  const { file } = req;
  const photo = await fileService.upload(file);
  const blog = await blogService.createBlog({ ...req.body, photo });
  await fileService.deleteLocal(file.path);
  res.send(blog);
});

const getBlogs = catchAsync(async (req, res) => {
  let filter;
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  if (req.query.search) {
    filter = {
      ...filter,
      $or: [
        { title: new RegExp(req.query.search, "gi") },
        { subTitle: new RegExp(req.query.search, "gi") },
        { catagery: new RegExp(req.query.search, "gi") },
        { content: new RegExp(req.query.search, "gi") },
        { info: new RegExp(req.query.search, "gi") },
      ],
    };
  }
  if (req.query.catagery) {
    filter = {
      ...filter,
      catagery: new RegExp(req.query.catagery, "gi"),
    };
  }
  const result = await blogService.queryBlogs(filter, {
    ...options,
  });
  res.send(result);
});

const getBlog = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogById(req.params.blogId);

  if (!blog) {
    throw new ApiError(httpStatus.NOT_FOUND, "Blog not found");
  }

  res.send(blog);
});

const updateBlogById = catchAsync(async (req, res) => {
  const blog = await blogService.updateBlogById(req.params.blogId, {
    ...req.body,
  });

  res.send(blog);
});

const deleteBlogById = catchAsync(async (req, res) => {
  await blogService.deleteBlogById(req.params.blogId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createBlog,
  getBlogs,
  getBlog,
  updateBlogById,
  deleteBlogById,
};
