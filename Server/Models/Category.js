//import mongoos
const mongoose = require("mongoose");

//Catogery Schema
const catogerySchema = new mongoose.Schema(
  {
    name: {
      type: "String",
      required: true,
    },
    description: {
      type: "String",
    },
    course: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    }],
  },
  { timestamps: true }
);

// Exports
module.exports = mongoose.model("Catogery", catogerySchema);
