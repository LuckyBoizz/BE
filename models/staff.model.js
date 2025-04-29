// models/staff.model.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const GeneralUser = require("./generalUser.model");

module.exports = GeneralUser.discriminator('Staff', new Schema({
    // jobPosition: { type: String, required: true }
}));
