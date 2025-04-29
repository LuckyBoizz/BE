// models/equipment.js
const mongoose = require("mongoose");
const InvoiceMaintenance = require("./invoiceMaintenance.model");

const EquipmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    typeName: {
      type: mongoose.Schema.Types.String,
      ref: "Type",
      required: true,
    },
    purchasePrice: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      required: true,
      enum: ["Available", "Maintenance", "Error"],
      default: "Available",
    },
    maintenanceHistory: [
      {
        invoiceMaintenanceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Invoice",
        },
        date: { type: Date, default: Date.now },
        description: { type: String, default: "Bảo trì định kỳ" },
      },
    ],
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Equipment", EquipmentSchema);
