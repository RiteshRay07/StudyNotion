//import mongoos
const mongoose = require("mongoose");

//Course Progress Schema
const courseProgressSchema = new mongoose.Schema(
  {
    courseID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    completedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection",
      },
    ],
  }
  
);

// Exports
module.exports = mongoose.model("CourseProgress", courseProgressSchema);
