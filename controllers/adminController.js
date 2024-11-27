const admin = require("../models/adminModel");
const user = require("../models/user");
const seller = require("../models/sellerModel");
const product = require("../models/productModel");
const order = require("../models/orderModel");
const request = require("../models/ReturnReplacement");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerAdmin = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const existingAdmin = await admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new admin({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error register Admin" + error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const adminData = await admin.findOne({ email });
    if (!adminData) {
      return res.status(400).json({ message: "Admin not found" });
    }
    const isMatch = await bcrypt.compare(password, adminData.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { id: adminData._id },
      process.env.JWT_ADMIN_SECRET_KEY
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res
      .status(200)
      .json({ data: adminData._id, message: "Admin logged in successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error login Admin" + error.message });
  }
};

const verifyAdmin = async (req, res) => {
  return res.json({
    message: "Admin verified successfully",
    success: true,
    id: req.admin._id,
  });
};

const logoutAdmin = async (req, res) => {
  try {
    // const { id } = req.admin;
    // const adminData = await admin.findById(id);
    // if (!adminData) {
    //   return res.status(404).json({ message: "Admin not found" });
    // }
    res.cookie("token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ message: "Admin logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Logout Admin " + error.message });
  }
};

const getallUsers = async (req, res) => {
  try {
    const userData = await user.find();
    if (!userData) {
      return res.status(400).json({ message: "No users found" });
    }
    res.status(200).json(userData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error get all users" + error.message });
  }
};

const getallSellers = async (req, res) => {
  try {
    const sellerData = await seller.find();
    if (!sellerData) {
      return res.status(400).json({ message: "No sellers found" });
    }
    res.status(200).json(sellerData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Getting all Sellers" + error });
  }
};

const getallProducts = async (req, res) => {
  try {
    const productData = await product.find();
    if (!productData) {
      return res.status(400).json({ message: "No products found" });
    }
    res.status(200).json(productData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Getting all Products" + error });
  }
};

const getallOrders = async (req, res) => {
  try {
    const orderData = await order.find().populate("items.productId");
    if (!orderData) {
      return res.status(400).json({ message: "No Order found" });
    }
    res.status(200).json(orderData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Getting all Orders" + error });
  }
};

const getallRequests = async (req, res) => {
  try {
    const requestData = await request.find();
    if (!requestData) {
      return res.status(400).json({ message: "No Request found" });
    }
    res.status(200).json(requestData);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Getting all Requests" + error });
  }
};

module.exports = {
  registerAdmin,
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
  getallUsers,
  getallSellers,
  getallProducts,
  getallOrders,
  getallRequests,
};
