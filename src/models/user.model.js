const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { private, paginate, softDelete } = require("./plugins");
const { roles } = require("../config/roles");

const userSchema = mongoose.Schema(
  {
    givenName: {
      type: String,
      trim: true,
    },
    mobileNumber: {
      dialCode: { type: String, default: "+91" },
      phone: { type: String },
    },
    type: {
      type: String,
      required: true,
      default: roles.user,
      enum: [roles.po, roles.ro, roles.aro],
    },
    constituencyNumber: { type: Number },
    numberOfPollingStation: { type: Number },
    isScrutinySubmitActive: { type: Boolean, default: true, private: true },
    scrutiny: { type: mongoose.SchemaTypes.ObjectId },
    password: {
      type: String,
      required: false,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
      private: true, // used by the private plugin
    },
  },
  {
    timestamps: true,
  }
);

userSchema.plugin(softDelete);
userSchema.plugin(private);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if mobile is taken
 * @param {string} phone - The user's mobile phone
 * @param {string} dialCode - The user's dial code
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isMobileNumberTaken = async function (
  dialCode,
  phone,
  excludeUserId
) {
  const user = await this.findOne({
    mobileNumber: { dialCode, phone },
    _id: { $ne: excludeUserId },
  });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema, "users");

module.exports = User;
