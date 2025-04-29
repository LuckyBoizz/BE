/** @format */

const express = require("express");
const {
  getAllEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getTodayEvents,
  getEventByDate,
  getUpcomingEvents,
  getOngoingEvents,
} = require("../controllers/event.controller.js");
const { get } = require("mongoose");

const router = express.Router();

router.get("/", getAllEvents);

router.get("/getId/:id", getEvent);

router.post("/create", createEvent);

router.put("/update/:id", updateEvent);

router.delete("/:id", deleteEvent);

router.get("/today", getTodayEvents);

router.get("/getEventByDate/:date", getEventByDate); //data format: isoString()

router.get("/upcoming", getUpcomingEvents); //data format: isoString()

router.get("/ongoing", getOngoingEvents);

module.exports = router;
