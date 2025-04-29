// models/event.js
const mongoose = require("mongoose");
const moment = require("moment-timezone");

const EventSchema = new mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
      get: function (date) {
        return date ? moment(date).format("DD-MM-YYYY HH:mm") : null;
      },
    },
    endDate: {
      type: Date,
      required: true,
      get: function (date) {
        return date ? moment(date).format("DD-MM-YYYY HH:mm") : null;
      },
    },
    eventTitle: { type: String, required: true },
    eventDescription: { type: String, required: true },
    // location: { type: String, required: true },
    backdrop: { type: String, required: true },
    // discountRateVip: { type: Number, required: true, default: 0 },
    // discountRateSupervip: { type: Number, required: true, default: 0 },
    // discountRateNormal: { type: Number, required: true, default: 0 },
    discountRate: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

// Validate that endDate is after startDate
// EventSchema.pre("save", function (next) {
//   if (this.endDate <= this.startDate) {
//     next(new Error("End date must be after start date"));
//   }
//   next();
// });

// EventSchema.statics.getEventDiscountPrice = function (ticketType) {
//   switch (ticketType) {
//     case "SuperVIP":
//       return this.discountRateSupervip;
//     case "VIP":
//       return this.discountRateVip;
//     case "Normal":
//       return this.discountRateNormal;
//     default:
//       return 0;
//   }
// };

module.exports = mongoose.model("Event", EventSchema);
