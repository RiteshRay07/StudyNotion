const Section = require("../Models/Section");
const Course = require("../Models/Course");
const SubSection = require("../Models/SubSection");

//*******************************************************************************
//                                  Create Section Function  
//*******************************************************************************

// Create Section
exports.createSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, courseId } = req.body;
    // data validation
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "All fileds are required",
      });
    }
    // create Section
    const newSection = await Section.create({ sectionName });
    // update section in Course Schema
    const updatedCourseDetails = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      { new: true }
    ).populate({
      path:"courseContent",
      populate:{
        path:"subSection",
      },
    }).exec();

    // Use Populate to replace sections / sub-section both in the updated course                                            // return Response
    res.status(200).json({
      success: true,
      message: "Section Created Successfully",
      updatedCourseDetails,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Section Creation failde, in Section Controller",
    });
  }
};

//*******************************************************************************
//                                  Update Course Function  
//*******************************************************************************

// Update Section
exports.updateSection = async (req, res) => {
  try {
    //data fetch
    const { sectionName, sectionId,courseId } = req.body;
    const section = await Section.findByIdAndUpdate(
			sectionId,
			{ sectionName },
			{ new: true }
		);
    const course = await Course.findById(courseId)
		.populate({
			path:"courseContent",
			populate:{
				path:"subSection",
			},
		})
		.exec();
    //update Section
    

    // Use Populate to replace sections / sub-section both in the updated course                                            // return Response
    return res.status(200).json({
      success: true,
      message: "Section Updated Successfully",
      Section,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Section Updatation failed, in Section Controller",
    });
  }
};

//*******************************************************************************
//                                  Delete Section Function  
//*******************************************************************************

//   Delete Section
exports.deleteSection = async (req, res) => {
	try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
};   
