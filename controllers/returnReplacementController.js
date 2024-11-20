const ReturnReplacement = require("../models/ReturnReplacement");
const Order = require("../models/orderModel");
const productModel = require("../models/productModel");
const user = require("../models/user");

const requestReturnReplacement = async (req, res) => {
  try {
    const { orderId, productId, requestType, reason, quantity } = req.body;
    const userId = req.user.id;
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({ message: "Order not found" });
    }
    const request = new ReturnReplacement({
      orderId,
      userId,
      productId,
      requestType,
      reason,
    });

    await request.save();
    if (request.requestType === "return") {
      const product = await productModel.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
      const totalPrice = product.price * quantity;
      request.status = "returned";
      await request.save();

      product.quantity += quantity;
      await product.save();

      return res.status(201).json({
        message: `Return request submitted successfully.`,
        totalPrice,
      });
    }

    if (request.requestType === "replacement") {
      const product = await productModel.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.quantity} items are available for replacement.`,
        });
      }

      request.status = "replacement";
      await request.save();

      product.quantity -= quantity;
      await product.save();

      return res.status(201).json({
        message: "Replacement request submitted successfully.",
      });
    }
    return res
      .status(201)
      .json({ message: `Request for ${requestType} submitted successfully.` });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Failed to submit request.", error });
  }
};

// admin approval (seller side)
const updateRequestStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body;
    const requestData = await ReturnReplacement.findById(requestId);
    if (!requestData) {
      return res
        .status(404)
        .json({ success: false, message: "Request not found" });
    }
    const product = await productModel.findById(requestData.productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    const request = await ReturnReplacement.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: `Request status updated to ${status}.`, request });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to update request status.", error });
  }
};

module.exports = { requestReturnReplacement, updateRequestStatus };
