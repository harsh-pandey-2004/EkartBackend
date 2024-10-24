const orderModel = require("../models/orderModel");
const userModel = require("../models/user");
const productModel = require("../models/productModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");

const placeOrdercart = async (req, res) => {
  const frontEndUrl = process.env.PAYMENT_FRONTEND_URL;

  const { id, address } = req.body;

  try {
    const userdata = await userModel
      .findById(id)
      .populate("cartItems.productId");

    if (!userdata || userdata.cartItems.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in cart" });
    }

    const items = userdata.cartItems.map((cartItem) => ({
      productId: cartItem.productId._id,
      name: cartItem.productId.name,
      price: cartItem.productId.price,
      quantity: cartItem.quantity,
    }));

    const amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new orderModel({
      userId: id,
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
      amount: amount,
      address: address,
    });

    await newOrder.save();

    await userModel.findByIdAndUpdate(id, { $set: { cartItems: [] } });

    const line_items = items.map((elm) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: elm.name,
        },
        unit_amount: elm.price * 100,
      },
      quantity: elm.quantity,
    }));

    // Adding delivery charges as a separate line item
    // line_items.push({
    //   price_data: {
    //     currency: "inr",
    //     product_data: {
    //       name: "Delivery Charges",
    //     },
    //     unit_amount: 20 * 100, // Flat 20 INR delivery charge
    //   },
    //   quantity: 1,
    // });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontEndUrl}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontEndUrl}/verify?success=false&orderId=${newOrder._id}`,
    });

    return res.json({
      success: true,
      session_url: session.url,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something Went Wrong " + error,
    });
  }
};

const placeOrderProduct = async (req, res) => {
  const { productId, userId, quantity, address } = req.body;

  try {
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const totalPrice = product.price * quantity;

    const newOrder = new orderModel({
      userId: userId,
      items: [{ productId, quantity }],
      amount: totalPrice,
      address: address,
    });

    await newOrder.save();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product.name,
            },
            unit_amount: product.price * 100,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${process.env.PAYMENT_FRONTEND_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${process.env.PAYMENT_FRONTEND_URL}/verify?success=false&orderId=${newOrder._id}`,
    });

    return res.json({
      success: true,
      message: "Order placed successfully",
      session_url: session.url,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Error: " + error.message });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.params;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      return res.json({
        success: true,
        message: "Payment successful, order confirmed!",
      });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({
        success: false,
        message: "Payment failed, order cancelled.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong - " + error,
    });
  }
};

module.exports = { placeOrdercart, verifyOrder, placeOrderProduct };
