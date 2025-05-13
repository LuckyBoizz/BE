// models/ticket.js
const mongoose = require("mongoose");
const TicketSchema = new mongoose.Schema({
  ticketType: {
    type: String,
    required: true,
    // enum: ["Normal", "Weekend", "Test"],
  },
  bonus: { type: Number, require: true, default: 0 },
  price: { type: Number, required: true, default: 0 },
  // priceAfterDiscount: { type: Number, required: true, default: 0 },
  // event: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "Event",
  //   required: true,
  // },
  backgroundColor: { type: String, required: true },
  icon: { type: String, required: true },
});

module.exports = mongoose.model("Ticket", TicketSchema);
