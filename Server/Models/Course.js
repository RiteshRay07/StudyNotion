//import mongoos
const mongoose = require("mongoose");

//Course Schema
const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      
    },
    courseDescription: {
      type: String,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    whatYouWillLearn: {
      type: String,
    },
    courseContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
    ratingAndReviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RatingAndReview",
      },
    ],
    price: {
      type: Number,
    },
    thumbnail: {
      type: String,
    },
    catogery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Catogery",
    },
    tags: [{
      type: [String],
      required: true,
    }],
    studentsEnrolled: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    instructions: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["Draft", "Published"],
    },
    createdAt: {
      type:Date,
      default:Date.now
    },
  }
);

// Exports
module.exports = mongoose.model("Course", courseSchema);
