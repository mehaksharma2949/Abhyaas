// src/models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  codeHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

module.exports = mongoose.model("Otp", otpSchema);
