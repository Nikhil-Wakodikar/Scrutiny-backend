const httpStatus = require("http-status");
const pick = require("../utils/pick");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const { cityService } = require("../services");

const getCities = catchAsync(async (req, res) => {
  let filter = { name: "A", countryCode: "IN" };
  filter = pick(req.query, ["name", "countryCode"]);
  // let options = { page: 1, limit: 10 };
  let options = pick(req.query, ["page", "limit"]);
  const result = cityService.searchByNameAndCountryWithPagination(
    filter,
    options.page,
    options.limit
  );
  res.send(result);
});

module.exports = { getCities };
