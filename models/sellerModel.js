const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  businessName: {
    type: String,
    required: true,
  },
  shopAddress: {
    type: String,
    required: true,
  },
  gstNumber: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: Number,
    required: true,
  },
  ifsc_code: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Seller", sellerSchema);
