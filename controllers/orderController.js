const orderModel = require("../models/orderModel");
const userModel = require("../models/user");
const productModel = require("../models/productModel");
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const mongoose = require("mongoose");

const placeOrdercart = async (req, res) => {
  const frontEndUrl = process.env.PAYMENT_FRONTEND_URL;

  const { address } = req.body;
  const { id } = req.user;
  function generateOrderId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");

    const orderId = `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
    return orderId;
  }
  const orderId = generateOrderId();
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
      generatedId: orderId,
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
  const { productId, quantity, address } = req.body;
  const userId = req.user.id;
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

const getOrderWithInvoices = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await orderModel
      .findById(orderId)
      .populate("items.productId");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const invoices = order.items.map((item) => {
      const { productId, quantity } = item;
      const total = productId.price * quantity;

      return {
        productName: productId.name,
        productPrice: productId.price,
        quantity: quantity,
        total: total,
        userId: order.userId,
        orderId: order._id,
        orderDate: order.createdAt,
      };
    });

    return res.json({
      success: true,
      orderId: order._id,
      userId: order.userId,
      address: order.address,
      totalAmount: order.amount,
      paymentStatus: order.payment,
      invoices: invoices,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong - " + error.message,
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel
      .find({ userId })
      .populate("items.productId");
    if (!orders) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found" });
    }
    return res.json({ success: true, orders });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "error in list orders " + error.message });
  }
};

module.exports = {
  placeOrdercart,
  verifyOrder,
  placeOrderProduct,
  getOrderWithInvoices,
  listOrders,
};
