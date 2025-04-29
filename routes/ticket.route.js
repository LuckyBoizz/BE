/** @format */

const express = require("express");
const {
  getAllTickets,
  getTicket,
  createTicket,
  updateTicket,
  deleteTicket,
  calculateTicketPayment,
  calculateForNewMember,
} = require("../controllers/ticket.controller.js");

const router = express.Router();

router.get("/", getAllTickets);

router.get("/getId/:id", getTicket);

router.post("/create", createTicket);

router.put("/update/:id", updateTicket);

router.delete("/:id", deleteTicket);

router.post("/calculateTicketPrice", calculateTicketPayment);

router.post("/calculateForNewMember", calculateForNewMember);

module.exports = router;
