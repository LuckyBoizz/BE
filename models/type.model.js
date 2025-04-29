// models/ticket.js
const mongoose = require("mongoose");
const TypeSchema = new mongoose.Schema({
  typeName: {
    type: String,
    required: true,
  },
  count: { type: Number, require: true, default: 0 },
  code: { type: String, require: true },
});

module.exports = mongoose.model("Type", TypeSchema);
