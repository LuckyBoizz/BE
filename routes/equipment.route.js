/** @format */

const express = require("express");
const {
  getAllEquipments,
  getEquipment,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  calculatePriceImportEquipment,
  calculatePriceMaintenanceEquipment,
  getEquipmentByStatus,
} = require("../controllers/equipment.controller.js");

const router = express.Router();

router.get("/", getAllEquipments);

router.get("/getId/:id", getEquipment);

router.post("/create", createEquipment);

router.put("/update/:id", updateEquipment);

router.delete("/:id", deleteEquipment);

router.post("/calculatePriceImport", calculatePriceImportEquipment);

router.post("/calculatePriceMaintenance", calculatePriceMaintenanceEquipment);

router.get("/status/:status", getEquipmentByStatus);

module.exports = router;
