const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser({
    ...req.body,
  });
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["givenName", "role"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await userService.queryUsers(filter, {
    ...options,
    populate: [
      {
        path: "_id givenName familyName email",
      },
    ],
  });
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await (
    await userService.getUserById(req.params.userId)
  ).populate("_id", "givenName familyName", "email");
  const user2 = user.populate();
  console.log(user2);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  res.send(req.user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await (
    await userService.updateUserById(req.params.userId, req.body)
  ).populate(
    "_id givenName familyName email bio gender dateOfBirth phone profileImg"
  );
  res.send(user);
});

const updateOrg = catchAsync(async (req, res) => {
  const org = await userService.updateOrgById(req.params.orgId, req.body);
  res.send(org);
});

const savePost = catchAsync(async (req, res) => {
  const user = await (
    await userService.savepostById(req.params.postId, req.user._id)
  ).populate("savedPosts", "_id storyImg");
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateScrutinySubmit = catchAsync(async (req, res) => {
  if (req.user.type !== "ro") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid request");
  }
  const user = await userService.updateScrutinySubmit(
    req.user._id,
    !req.user.isScrutinySubmitActive
  );
  res.send({ isScrutinySubmitActive: !req.user.isScrutinySubmitActive });
});

const getVotingPercent = catchAsync(async (req, res) => {
  if (req.user.type !== "ro") {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Access Denied");
  }
  const results = await userService.getVotingPercent(req.user._id);

  res.send({ results });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  savePost,
  deleteUser,
  updateOrg,
  updateScrutinySubmit,
  getVotingPercent,
};
