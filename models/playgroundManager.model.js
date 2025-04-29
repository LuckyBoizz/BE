// models/playgroundManager.model.js
const mongoose = require("mongoose");
const GeneralUser = require("../models/generalUser.model");

module.exports = GeneralUser.discriminator('PlaygroundManager', new mongoose.Schema({
	position: { type: String, required: true }
}));
