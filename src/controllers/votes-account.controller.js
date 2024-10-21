const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { votesAccountService } = require("../services");

const createVotesAccount = catchAsync(async (req, res) => {
  const votesAccount = await votesAccountService.createVotesAccount({
    ...req.body,
  });
  res.status(httpStatus.CREATED).send(votesAccount);
});

const getVotesAccounts = catchAsync(async (req, res) => {
  const filter = pick(req.query, ["givenName"]);
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await votesAccountService.queryVotesAccount(filter, {
    ...options,
  });
  res.send(result);
});

const getVotesAccount = catchAsync(async (req, res) => {
  const votesAccount = await await votesAccountService.getVotesAccountById(
    req.params.votesAccountId
  );

  if (!votesAccount) {
    throw new ApiError(httpStatus.NOT_FOUND, "Record not found");
  }

  res.send(votesAccount);
});

module.exports = { createVotesAccount, getVotesAccounts, getVotesAccount };
