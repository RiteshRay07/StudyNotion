const Category = require("../Models/Category");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}
//*********************************************************************
//                     CREATE CATOGERY
//*********************************************************************

exports.createCatogery = async (req, res) => {
  try {
    //Fetch Data
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
      });
    }
    //Create Entry in Database
    const catogeryDetails = await Category.create({
      name: name,
      description: description,
    });
    console.log(catogeryDetails);

    //return response
    return res.status(200).json({
      success: true,
      message: "Catogery created Successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Catogery Creation Failed,  Error in Catogery Controller",
    });
  }
};

//**********************************************************************
//                        Get All CATOGERY
//**********************************************************************

//=======Get All Catogery
exports.showAllCatogery = async (req, res) => {
  try {
    const allCatogery = await Category.find({});
    return res.status(200).json({
      success: true,
      message: "All Catogery Fetched Successfully",
      data: allCatogery,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Fetch Catogery failed",
    });
  }
};

//**********************************************************************
//                           CATOGERY PAGE DETAILS
//**********************************************************************

exports.catogeryPageDetails = async (req, res) => {
  try {
    const { catogeryId } = req.body;

    // Get Course for the specified catogery
    const selectedCatogery = await Category.findById(catogeryId)
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: "ratingAndReviews",
      })
      .exec();
    console.log(selectedCatogery);

    // Handel the case when the catogery is not found
    if (!selectedCatogery) {
      console.log("Catogery not Found.");
      return res.status(404).json({
        success: false,
        message: "catogery not found",
      });
    }

    // Handel the case when there are no course
    if (selectedCatogery.course.length === 0) {
      console.log("No course found for the selected catogery");
      return res.status(404).json({
        success: false,
        message: "No courses found for the selected catogery",
      });
    }

    //const selectedCourses = selectedCatogery.course;

    // Get courses for others catogeries
    const catogeriesExceptSelected = await Category.find({
      _id: { $ne: catogeryId },
    });

    let differentCategory = await Category.findOne(
      catogeriesExceptSelected[getRandomInt(catogeriesExceptSelected.length)]
        ._id
    )
      .populate({
        path: "courses",
        match: { status: "Published" },
      })
      .exec();

    // Get top selling course accross all catogery
    // Get top-selling courses across all categories
    const allCategories = await Category.find()
      .populate({
        path: "courses",
        match: { status: "Published" },
        populate: {
          path: "instructor",
        },
      })
      .exec();
    const allCourses = allCategories.flatMap((category) => category.courses);
    const mostSellingCourses = allCourses
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);

    // rersponse
    res.status(200).json({
      success: true,
      data: {
        selectedCatogery,
        differentCategory,
        mostSellingCourses,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
