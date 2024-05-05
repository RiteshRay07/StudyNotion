//import mongoos
const mongoose = require("mongoose");

//Section Schema
const sectionSchema = new mongoose.Schema(
  {
    sectionName: {
      type: String,
    },
    subSection: [{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "SubSection",
    }],
  }
);

// Exports
module.exports = mongoose.model("Section", sectionSchema);
