const express = require("express");
const app = express();

const userRoutes = require("./Routes/User");
const profileRoutes = require("./Routes/Profile");
const paymentRoutes = require("./Routes/Payments");
const courseRoutes = require("./Routes/Course");
const contactUsRoute = require("./Routes/Contact");

require("dotenv").config();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");

const PORT = process.env.PORT || 4000;

// DataBase Connect
database.connect();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

// cloudinary connect
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);

// Default Route
app.get("/", (req, res) => {
  return res.json({
    scceess: true,
    message: "Your server is up and running...",
  });
});

// Activate the Server
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
