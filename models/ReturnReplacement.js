const mongoose = require("mongoose");

const returnReplacementSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  requestType: {
    type: String,
    enum: ["return", "replacement"],
    required: true,
  },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "completed",
      "returned",
      "replacement",
      "refund complete",
    ],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ReturnReplacement", returnReplacementSchema);
