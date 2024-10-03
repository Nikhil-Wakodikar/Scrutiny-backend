const mongoose = require("mongoose");
const { private, paginate, softDelete } = require("./plugins");

const blogSchema = mongoose.Schema(
  {
    photo: {
      type: String,
    },
    title: {
      type: String,
      trim: true,
    },
    content: {
      type: String,
    },
    info: {
      type: String,
    },
    subTitle: {
      type: String,
    },
    servings: {
      type: String,
    },
    prepTime: {
      type: String,
    },
    cookTime: {
      type: String,
    },
    videoLink: {
      type: String,
    },
    catagery: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.plugin(softDelete);
blogSchema.plugin(private);
blogSchema.plugin(paginate);

/**
 * @typedef Blog
 */
const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;
