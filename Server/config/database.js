const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => {
      console.log("DataBase Connected Successfully");
    })
    .catch((error) => {
      console.log("Error in Database Connection");
      console.error(error);
      process.exit(1);
    });
};
