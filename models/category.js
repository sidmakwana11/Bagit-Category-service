const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

categorySchema.pre('findOneAndDelete', async function (next) {
  const categoryId = this.getQuery()["_id"];
  await mongoose.model("SubCategory").deleteMany({ category: categoryId });
  await mongoose.model("SubSubCategory").deleteMany({ category: categoryId });
  next();
});

module.exports = mongoose.model("Category", categorySchema);
