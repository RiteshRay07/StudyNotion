//import mongoos
const mongoose = require("mongoose");

//profile Schema
const profileSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
    },
    dateOfBirth: {
      type: String,
    },
    about: {
      type: String,
      trim: true,
    },
    contactNumber: {
      type: Number,
      trim: true,
    },
  }
);

// Exports
module.exports = mongoose.model("Profile", profileSchema);
