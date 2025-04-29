/** @format */

const express = require("express");
const {
  getAllSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplier.controller.js");

const router = express.Router();

router.get("/", getAllSuppliers);

router.get("/getId/:id", getSupplier);

router.post("/create", createSupplier);

router.put("/update/:id", updateSupplier);

router.delete("/:id", deleteSupplier);

module.exports = router;
