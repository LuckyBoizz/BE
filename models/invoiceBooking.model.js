// models/invoiceBooking.js
const mongoose = require("mongoose");
const Invoice = require("./invoice.model");

const InvoiceBookingSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    // required: true,
  },
  tickets: [
    {
      ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
      },
      ticketType: { type: String },
      quantity: { type: Number },
      bonus: { type: Number, default: 0 },
      bonusAmount: { type: Number },
      originalPrice: { type: Number },
      priceAfterEventDiscount: { type: Number },
      finalPricePerTicket: { type: Number },
      totalForTicketType: { type: Number },
    },
  ],
  membershipDiscount: { type: String },
  qrCode: { type: String },
});

const InvoiceBooking = Invoice.discriminator(
  "InvoiceBooking",
  InvoiceBookingSchema
);

module.exports = InvoiceBooking;
