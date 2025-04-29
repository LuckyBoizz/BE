/** @format */

const express = require("express");
const {
  getRevenueByDateRange,
  getTicketStatistics,
  getMaintenanceStatistics,
} = require("../controllers/report.controller.js");

const router = express.Router();

router.get("/revenue", getRevenueByDateRange);

router.get("/ticket", getTicketStatistics);

router.get("/maintenance", getMaintenanceStatistics);

module.exports = router;
