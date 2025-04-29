// models/supplier.js
const mongoose = require("mongoose");

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
      "Please enter a valid email address",
    ],
    validate: {
      validator: function (email) {
        // Kiểm tra thêm các điều kiện khác nếu cần
        return email.length <= 50; // Ví dụ: email không được dài quá 50 ký tự
      },
      message: (props) =>
        `${props.value} is not a valid email! Email must be less than 50 characters`,
    },
  },
  // address: { type: String, required: true },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (phone) {
        // Regex cho số điện thoại Việt Nam:
        // - Số di động: (03|05|07|08|09)+([0-9]{8})
        // - Số cố định: (02)+([0-9]{9})
        const phoneRegex = /^((\+84|84|0)([235789]))([0-9]{8})$/;
        return phoneRegex.test(phone);
      },
      message: (props) =>
        `${props.value} is not a valid phone number! Phone number must be a valid Vietnamese phone number`,
    },
  },
  logo: { type: String, required: true },
  equipmentId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment", // Reference to the Equipment model
      required: true,
    },
  ],
});

SupplierSchema.pre("save", function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

// Verify phone number
SupplierSchema.pre("save", function (next) {
  if (this.phoneNumber) {
    // Xóa khoảng trắng và các ký tự đặc biệt
    this.phoneNumber = this.phoneNumber
      .replace(/\s+/g, "")
      .replace(/[-.()+]/g, "");

    // Chuẩn hóa số điện thoại về định dạng 0xxxxxxxxx
    if (this.phoneNumber.startsWith("+84")) {
      this.phoneNumber = "0" + this.phoneNumber.slice(3);
    } else if (this.phoneNumber.startsWith("84")) {
      this.phoneNumber = "0" + this.phoneNumber.slice(2);
    }
  }
  next();
});

module.exports = mongoose.model("Supplier", SupplierSchema);
