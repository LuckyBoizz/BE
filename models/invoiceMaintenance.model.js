// models/invoiceMaintenance.js
const mongoose = require("mongoose");
const Invoice = require("./invoice.model");

const InvoiceMaintenanceSchema = new mongoose.Schema({
  title: { type: String },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",
    required: true,
  },
  equipments: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
      },
      typeName: {
        type: mongoose.Schema.Types.String,
        ref: "Type",
      },
      description: { type: String },
      price: { type: Number },
      code: { type: String },
    },
  ],
});

const InvoiceMaintenance = Invoice.discriminator(
  "InvoiceMaintenance",
  InvoiceMaintenanceSchema
);

module.exports = InvoiceMaintenance;
