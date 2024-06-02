// import models
const User = require("../Models/User");
const OTP = require("../Models/OTP");
const Profile = require("../Models/Profile");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../Utils/mailSender");
const { passwordUpdated } = require("../Mail/templates/passwordUpdate");
const { registerSuccess } = require("../Mail/templates/registerSuccess");
require("dotenv").config();

//*******************************************************************************
//                                  SignUp Function
//*******************************************************************************

//===================== Signup

exports.signUp = async (req, res) => {
  try {
    //data fetch from request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //Validate

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2 password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. please try again.",
      });
    }

    // check user already exist or not
    const existingUser = await User.findOne({ email });

    //if user found
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      });
    }

    //find most recent OTP stored for the user
    const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
    console.log("OTP response-> ", response);

    //validate OTp
    if (response.length == 0) {
      //OTP not found
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    } else if (otp !== response[0].otp) {
      //Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      });
    }

    //hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the User
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);
    //entry create in Database

    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      AdditionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //We can Send a mail to user -> Register Successfully
    try {
      const registerMail = await mailSender(
        email,
        "Welcome Email",
        registerSuccess(email, firstName)
      );
      console.log("Register mail send successfully");
    } catch (error) {
      console.error("error to send register mail", error);
      console.log("error to send register mail");
    }

    //return res
    return res.status(200).json({
      success: true,
      user,
      message: "User registred Successfully",
    });
  } catch (error) {
    console.log("Error Occure in signUP method in Auth.js file ", error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registred. Please try again",
    });
  }
};

//*******************************************************************************
//                                  Login Function
//*******************************************************************************

//==================Login
exports.login = async (req, res) => {
  try {
    // Get data from request body
    const { email, password } = req.body;

    // validation of data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required, please try again",
      });
    }

    //check user is exist or not
    const user = await User.findOne({ email }).populate("AdditionalDetails");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, Please signUp to Continue",
      });
    }

    //Generate JWT ,after password matching
    if (await bcrypt.compare(password, user.password)) {
      //patload
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      //token

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });

      //insert token in user
      user.token = token;
      user.password = undefined;

      //create Cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };

      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User Login Successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is Incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login Failure, Please try again",
    });
  }
};

//*******************************************************************************
//                                  Send OTP Function
//*******************************************************************************

//============ Send OTP
exports.sendOTP = async (req, res) => {
  try {
    //fetxh email from request body
    const { email } = req.body;

    //check if user is already exist
    const isUserExist = await User.findOne({ email });

    // if user already exist , then return a response message
    if (isUserExist) {
      return res.status(401).json({
        success: false,
        message: "User Already Exist",
      });
    }

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP -> ", otp);

    //check unique otp or not
    let result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { email, otp };

    //create an entry for OTP
    const otpBody = await OTP.create(otpPayload);

    console.log("OTP Body", otpBody);

    //return response successful
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      otp,
    });
  } catch (error) {
    console.log(
      "Error occure while sending OTP in SendOTP function in file Auth.js ",
      error
    );
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
//*******************************************************************************
//                                  Change Password Function
//*******************************************************************************

//============Change Password

// Controller for Changing Password
exports.changePassword = async (req, res) => {
  try {
    // Get user data from req.user
    const userDetails = await User.findById(req.user.id);

    // Get old password, new password, and confirm new password from req.body
    const { oldPassword, newPassword } = req.body;

    // Validate old password
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      // If old password does not match, return a 401 (Unauthorized) error
      return res
        .status(401)
        .json({ success: false, message: "The password is incorrect" });
    }

    // Update password
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // Send notification email
    try {
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        "Password for your account has been updated",
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while sending email:", error);
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    // Return success response
    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
