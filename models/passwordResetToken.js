// models/passwordResetToken.js
const mongoose = require("mongoose");

const PasswordResetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "0" }, // TTL index to automatically delete after expiration
  },
});

module.exports = mongoose.model("PasswordResetToken", PasswordResetTokenSchema);
