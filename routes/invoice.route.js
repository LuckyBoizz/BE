/** @format */

const express = require("express");
const {
  getAllInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  findInvoice,
} = require("../controllers/invoice.controller.js");

const router = express.Router();

router.get("/", getAllInvoices);

router.get("/getId/:id", getInvoice);

router.post("/create", createInvoice);

router.put("/update/:id", updateInvoice);

router.delete("/:id", deleteInvoice);

router.get("/find/:orderCode", findInvoice);

module.exports = router;
