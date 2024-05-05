const User = require("../Models/User");
const mailSender = require("../Utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

//*******************************************************************************
//                                  Reset Password Token  
//*******************************************************************************

// reset password Token
exports.resetPasswordToken = async (req, res) => {
  try {
    //fetch data from req body
    const { email } = req.body;

    // check user is exist
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: `This Email: ${email} is not Registered with Us Enter a Valid Email`,
      });
    }

    //generate token
    const token = crypto.randomBytes(20).toString("hex");

    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    console.log("Details ",updatedDetails);
    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //Send mail contain
    await mailSender(
      email,
      "Password Reset Link",
      `your Link for email verification is ${url}. Please click this url to reset your password.`
    );
    //generate Link
    //return response
    res.json({
      success: true,
      message: "Eamil Sent Successfully, Please check your email to change Password",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};

//*******************************************************************************
//                                  Reset Password Function  
//*******************************************************************************

//reset password
exports.resetPassword = async (req, res) => {
  try {
    //fetch data
    const { password, confirmPassword, token } = req.body;

    //validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password and Confirm password not matching",
      });
    }
    // get user details from DatabAse usinh Token
    const userDetails = await User.findOne({ token: token });

    //if no entry -> invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "Token is Invalid",
      });
    }

    //token time check
    if (!(userDetails.resetPasswordExpires > Date.now())) {
      return res.status(403).json({
        success: false,
        message: "Token is Expired. Please regenerate your token",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //password update
    // await User.findByIdAndUpdate(
    //   { token: token },
    //   { password: hashedPassword },
    //   { new: true }
    // );
    await User.findByIdAndUpdate(
      userDetails._id, // Use the user's ID instead of { token: token }
      { password: hashedPassword },
      { new: true }
    );
    const email = userDetails.email; 
    await mailSender(
      email,
      "Password Reset Confirmation",
      `Your StudyNotion Account Password Changed Successfully`
    );
    return res.status(200).json({
      success: true,
      message: "Password Reset Successfull",
    });
    //return response
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while reseting password",
    });
  }
};
