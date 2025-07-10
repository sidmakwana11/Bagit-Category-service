const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    subCategory: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

subCategorySchema.pre('findOneAndDelete', async function (next) {
  const subCategoryId = this.getQuery()["_id"];
  await mongoose.model("SubSubCategory").deleteMany({ subCategory: subCategoryId });
  next();
});

module.exports = mongoose.model("SubCategory", subCategorySchema);
