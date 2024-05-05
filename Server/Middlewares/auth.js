const User = require("../Models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//*******************************************************************************
//                                  auth  function
//*******************************************************************************

// auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");

    // if token is missing,  then return response
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token is Missing",
      });
    }
    // Verify the Token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decode-> ", decode);

      req.user = decode;
    } catch (error) {
      //is any issue while verification
      return res.status(401).json({
        success: false,
        message: "Token is Invalid",
      });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Something Went Wrong While Validating the Token",
    });
  }
};

//*******************************************************************************
//                                  isStudent Function
//*******************************************************************************

//=================isStudent
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a Proccted route for Student Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again ",
    });
  }
};

//*******************************************************************************
//                                  isInstructor Function
//*******************************************************************************

//================isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a Proccted route for Instructor Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again ",
    });
  }
};

//*******************************************************************************
//                                  IsAdmin Function
//*******************************************************************************

//==========isAdmin

exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a Proccted route for Admin Only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "User role cannot be verified, Please try again ",
    });
  }
};
