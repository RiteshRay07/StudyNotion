//import mongoos
const mongoose = require("mongoose");

//Sub Section Schema
const subSectionSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  timeDuration: {
    type: String,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
});

// Exports
module.exports = mongoose.model("SubSection", subSectionSchema);
