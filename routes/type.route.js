/** @format */

const express = require("express");
const {
  getAllTypes,
  getType,
  createType,
  updateType,
  deleteType,
} = require("../controllers/type.controller.js");

const router = express.Router();

router.get("/", getAllTypes);

router.get("/getId/:id", getType);

router.post("/create", createType);

router.put("/update/:id", updateType);

router.delete("/:id", deleteType);

module.exports = router;
