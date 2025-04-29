// models/invoice.js
const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    orderCode: {
      type: Number,
      required: true,
    },
    subtotal: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PAID", "CANCELLED"],
      default: "PENDING",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, discriminatorKey: "__t" }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
