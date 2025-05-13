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
    createdAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
    },
    updatedAt: {
      type: Date,
      default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000),
    },
  },
  { timestamps: true, discriminatorKey: "__t" }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
