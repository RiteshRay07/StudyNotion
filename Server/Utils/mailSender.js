// import nodemailer
const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    // create transporter
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    //Send Mail
    let info =await transporter.sendMail({
      from: "StudyNotion - By Ritesh",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
    // pritn
    console.log(info);
    return info;

    
  } catch (error) {
    console.log("Error in mailSender");
    console.error(error);
  }
};

//Exports
module.exports = mailSender;
