const express = require("express");
const router = express.Router();

// Import routes
// const customerCardRouter = require("./customerCard.route");
const equipmentRouter = require("./equipment.route");
const eventRouter = require("./event.route");
const feedbackRouter = require("./feedback.route");
const generalUserRouter = require("./generalUser.route");
const invoiceRouter = require("./invoice.route");
const supplierRouter = require("./supplier.route");
const ticketRouter = require("./ticket.route");
const paymentRoutes = require("./payment.route");
const reportRouter = require("./report.route");
const typeRouter = require("./type.route");

// Use routes
// router.use("/customerCard", customerCardRouter);
router.use("/equipment", equipmentRouter);
router.use("/event", eventRouter);
router.use("/feedback", feedbackRouter);
router.use("/generalUser", generalUserRouter);
router.use("/invoice", invoiceRouter);
router.use("/supplier", supplierRouter);
router.use("/ticket", ticketRouter);
router.use("/payment", paymentRoutes);
router.use("/report", reportRouter);
router.use("/type", typeRouter);

// Export router
module.exports = router;
