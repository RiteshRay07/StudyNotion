const RatingAndReview = require("../Models/RatingAndReview");
const Course = require("../Models/Course");


//**********************************************************************
//                            Create Rating  
//**********************************************************************



exports.createRating = async (req, res) => {
  try {
    // get user ID
    const userId = req.user.id;

    // Fetch Data From request Body
    const { rating, review, courseId } = req.body;

    // check , user is enroled or not
    const courseDetails = await Course.findOne({
      _id: courseId,
      studentsEnrolled: { $elemMatch: { $eq: userId } },
    });
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "Student is Not enrolled in the course",
      });
    }
    // check , user is not already review
    const alreadyReviewed = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });
    if (alreadyReviewed) {
      return res.status(403).json({
        success: false,
        message: "Course Already Reviewed by the user",
      });
    }

    // create rating and review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      corse: courseId,
      user: userId,
    });
    //update course with this rating and review
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      { _id: courseId },
      {
        $push: {
          ratingAndReviews: ratingReview._id,
        },
      },
      { new: true }
    );
    console.log(updatedCourseDetails);
    // return response
    return res.status(200).json({
      success: true,
      message: "Rating and Review created Successfully",
      ratingReview,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//**********************************************************************
//                          Get Avg Rating 
//**********************************************************************


exports.getAverageRating = async (req, res) => {
  try {
    // get Course ID
    const courseId = req.body.courseId;

    // Calculate AVG Rating
    const result = await RatingAndReview.aggregate([
      {
        $match: {
          course: new Mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);
    // return rating
    if (result.length > 0) {
      return res.status(200).json({
        success: true,

        averageRating: result[0].averageRating,
      });
    }
    //if no reatinfg and reviews
    return res.status(200).json({
      success: true,
      message: "Average Rating is 0, no rating given till now",
      averageRating: 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//**********************************************************************
//                          Get All Rating  
//**********************************************************************


exports.getAllRating = async (req, res) => {
  try {
    // get all rating reviews
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "coursename",
      })
      .exec();
    // return response
    return res.status(200).json({
      success: true,
      message: "all reviews fetched Successfully",
      data: allReviews,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
