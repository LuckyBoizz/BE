/** @format */

const express = require("express");
const {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedback.controller.js");

const router = express.Router();

router.get("/", getAllFeedbacks);

router.get("/getId/:id", getFeedback);

router.post("/create", createFeedback);

router.put("/update/:id", updateFeedback);

router.delete("/:id", deleteFeedback);

module.exports = router;
