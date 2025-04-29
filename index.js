// app.js
require("dotenv").config();
const cors = require("cors")
const express = require("express");
// const bodyParser = require("body-parser");
const connectDB = require("./config/database");
const route = require("./routes/routes");

const app = express();
const PORT = process.env.SERVER_PORT || 3333;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sử dụng các route
app.use("/api", route);

// Kết nối đến MongoDB
connectDB()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.error("Error connecting to database:", error);
    process.exit(1);
  });

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
