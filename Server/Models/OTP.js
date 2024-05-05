//import mongoos
const mongoose = require("mongoose");
const mailSender = require("../Utils/mailSender");
const emailTemplate = require("../Mail/templates/emailVerificationTemplate")
//OTP Schema
const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60, // Automatically OTP delete after 5min
  },
});


//*******************************************************************************
//                                  Send mail Function  
//*******************************************************************************

// Function -> Send mail for OTP
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Verification Email",
      emailTemplate(otp)
    );
    console.log("Email Sent Successfully ", mailResponse.response);

  } catch (error) {
    console.log("error occured during send mail in OTP.js file ", error);
    throw error;
  }
}

//*******************************************************************************
//                                  Middleware Send mail  
//*******************************************************************************

// middleware to send mail
OTPSchema.pre("save",async function(next){
    
  // Only send an email when a new document is created
	if (this.isNew) {
		await sendVerificationEmail(this.email, this.otp);
	}
	next();
})

// Exports
const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;