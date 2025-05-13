// models/ticket.js
const Equipment = require("./equipment.model");
const e = require("cors");
const mongoose = require("mongoose");
const TypeSchema = new mongoose.Schema({
  typeName: {
    type: String,
    required: true,
  },
  count: { type: Number, require: true, default: 0 },
  code: { type: String, require: true },
  equipments: [
    {
      equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
      },
      code: { type: String, require: true },
    },
  ],
});

module.exports = mongoose.model("Type", TypeSchema);
