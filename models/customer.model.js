const mongoose = require("mongoose");
const GeneralUser = require("./generalUser.model");

const CustomerSchema = new mongoose.Schema({
  loyaltyPoints: { type: Number, default: 0 },
  cardType: { type: String, required: true, default: "Silver" },
  // firstTime: { type: Boolean, default: true },
});

// Middleware

// CardType is determined based on loyalty points
CustomerSchema.pre("save", function (next) {
  if (this.loyaltyPoints >= 300) {
    this.cardType = "Platinum";
  } else if (this.loyaltyPoints >= 100) {
    this.cardType = "Gold";
  } else {
    this.cardType = "Silver";
  }
  next();
});

CustomerSchema.statics.getDiscountMultiplier = function (cardType) {
  switch (cardType) {
    case "Platinum":
      return 0.8; // 20% discount
    case "Gold":
      return 0.9; // 10% discount
    case "Silver":
      return 0.95; // 5% discount
    default:
      return 1; // No discount
  }
};

const Customer = GeneralUser.discriminator("Customer", CustomerSchema);

module.exports = Customer;
