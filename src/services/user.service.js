const httpStatus = require("http-status");
const { User } = require("../models");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (
    await User.isMobileNumberTaken(
      userBody.mobileNumber.dialCode,
      userBody.mobileNumber.phone
    )
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User already exists with this mobile number"
    );
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({
    email,
  });
};

/**
 * Get user by mobile number
 * @param {string} dialCode
 * @param {string} phone
 * @returns {Promise<User>}
 */
const getUserByMobileNumber = async (dialCode, phone) => {
  return User.findOne({ mobileNumber: { dialCode, phone } });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "User already exists with this email"
    );
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Update organization by id
 * @param {ObjectId} orgId
 * @param {Object} updateBody
 * @returns {Promise<Organization>}
 */
const updateOrgById = async (orgId, updateBody) => {
  const org = await Organization.findById(orgId);
  if (!org) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Organization not found");
  }
  if (
    updateBody.email &&
    (await Organization.isEmailTaken(updateBody.email, orgId))
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Organization already exists with this email"
    );
  }
  Object.assign(org, updateBody);
  await org.save();
  return org;
};

const savepostById = async (postId, userId) => {
  const story = await Story.findById(postId);
  if (!story) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Post not found");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  const userBody = user;
  let saved = [...userBody.savedPosts];
  var isSaved = await user.savedPosts.some(function (friend) {
    return friend.equals(story._id);
  });
  // const isSaved = user.savedPosts.findById(postId)
  console.log(isSaved);
  if (isSaved) {
    const result = saved.filter((id) => id.toString() !== postId.toString());
    console.log(result);
    saved = result;
  } else if (!isSaved) {
    saved.push(postId);
  }
  userBody.savedPosts = saved;
  let updateBody = userBody;
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  await User.findByIdAndUpdate({ _id: userId }, { $unset: { profileImg: 1 } });
  return User;
};

/**
 * Update user isScrutinySubmitActive by id
 * @param {ObjectId} userId
 * @param {Boolean} status
 * @returns {Promise<User>}
 */
const updateScrutinySubmit = async (userId, status) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found");
  }
  Object.assign(user, { isScrutinySubmitActive: status });
  await user.save();
  return user;
};

/**
 * get user isScrutinySubmitActive by id
 * @param {ObjectId} userId
 * @returns {Promise<Boolean>}
 */
const getScrutinySubmit = async (userId) => {
  const user = await User.findOne({ type: "ro" });
  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "ro not found");
  }
  return user.isScrutinySubmitActive;
};

const getVotingPercent = async (userId) => {
  const pipeline = [
    {
      $match:
        /**
         * query: The query in MQL.
         */
        {
          _id: userId,
        },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "constituencies",
          localField: "constituencyNumber",
          foreignField: "numberOfConstituency",
          as: "constituency",
        },
    },
    {
      $unwind:
        /**
         * path: Path to the array field.
         * includeArrayIndex: Optional name for index.
         * preserveNullAndEmptyArrays: Optional
         *   toggle to unwind null and empty values.
         */
        {
          path: "$constituency",
          preserveNullAndEmptyArrays: true,
        },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "scrutinies",
          localField: "constituencyNumber",
          foreignField: "numberOfConstituency",
          as: "scrutiny",
        },
    },
    {
      $unwind:
        /**
         * path: Path to the array field.
         * includeArrayIndex: Optional name for index.
         * preserveNullAndEmptyArrays: Optional
         *   toggle to unwind null and empty values.
         */
        {
          path: "$scrutiny",
          preserveNullAndEmptyArrays: true,
        },
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: {
            constituencyNumber: "$constituencyNumber",
            electorsCount: "$constituency.electorsCount",
          },
          totalVoted: {
            $sum: "$scrutiny.personsVoted.total",
          },
        },
    },
    {
      $project:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          _id: 0,
          constituencyNumber: "$_id.constituencyNumber",
          electorsCount: "$_id.electorsCount",
          totalVotesAsPer17C: "$totalVoted",
          votingPercentAsPer17C: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ["$totalVoted", "$_id.electorsCount"],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
    },
    {
      $lookup:
        /**
         * from: The target collection.
         * localField: The local join field.
         * foreignField: The target join field.
         * as: The name for the results.
         * pipeline: Optional pipeline to run on the foreign collection.
         * let: Optional variables to use in the pipeline field stages.
         */
        {
          from: "votesAccounts",
          localField: "constituencyNumber",
          foreignField: "numberOfConstituency",
          as: "result",
        },
    },
    {
      $unwind:
        /**
         * path: Path to the array field.
         * includeArrayIndex: Optional name for index.
         * preserveNullAndEmptyArrays: Optional
         *   toggle to unwind null and empty values.
         */
        {
          path: "$result",
          preserveNullAndEmptyArrays: true,
        },
    },
    {
      $group:
        /**
         * _id: The id of the group.
         * fieldN: The first field name.
         */
        {
          _id: {
            constituencyNumber: "$constituencyNumber",
            electorsCount: "$electorsCount",
            totalVotesAsPer17C: "$totalVotesAsPer17C",
            votingPercentAsPer17C: "$votingPercentAsPer17C",
          },
          totalVotesAsPer17A: {
            $sum: "$result.countOfVotesRecordedAsVotingMachine",
          },
        },
    },
    {
      $project:
        /**
         * specifications: The fields to
         *   include or exclude.
         */
        {
          _id: 0,
          constituencyNumber: "$_id.constituencyNumber",
          electorsCount: "$_id.electorsCount",
          totalVotesAsPer17A: "$_id.totalVotesAsPer17C",
          votingPercentAsPer17A: "$_id.votingPercentAsPer17C",
          totalVotesAsPer17C: "$totalVotesAsPer17A",
          votingPercentAsPer17C: {
            $round: [
              {
                $multiply: [
                  {
                    $divide: ["$totalVotesAsPer17A", "$_id.electorsCount"],
                  },
                  100,
                ],
              },
              2,
            ],
          },
        },
    },
  ];
  return (await User.aggregate(pipeline))[0];
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  updateOrgById,
  savepostById,
  deleteUserById,
  getUserByMobileNumber,
  updateScrutinySubmit,
  getScrutinySubmit,
  getVotingPercent,
};
