// models/feedback.js
const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PlaygroundManager",
        required: true,
    },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Feedback", FeedbackSchema);
