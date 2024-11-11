const seller = require("../models/sellerModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerSeller = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      shopAddress,
      gstNumber,
      accountNumber,
      ifscCode,
      password,
    } = req.body;

    const existingseller = await seller.findOne({
      $or: [{ email }, { phone }],
    });
    if (existingseller) {
      return res.status(400).json({
        message: "Seller already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = new seller({
      name,
      email,
      phone,
      businessName,
      shopAddress,
      gstNumber,
      accountNumber,
      ifsc_code: ifscCode,
      password: hashedPassword,
    });
    await newSeller.save();
    res.status(201).json({ message: "Seller registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error registering Seller" + error });
  }
};

const loginSeller = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    const sellerData = await seller.findOne({ $or: [{ email }, { phone }] });
    if (!sellerData) {
      return res.status(400).json({ message: "Invalid email or phone number" });
    }
    const isValidPassword = await bcrypt.compare(password, sellerData.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { id: sellerData._id },
      process.env.JWT_SELLER_SECRET_KEY,
      {
        expiresIn: "2d",
      }
    );
    res.cookie("seller_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({
      message: "Seller logged in successfully",
      data: sellerData._id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Error Login Seller" + error });
  }
};

const sellerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerData = await seller.findById(id).select("-password");
    if (!sellerData) {
      return res.status(404).json({ message: "Seller not found" });
    }
    return res.status(200).json({
      message: "Seller profile fetched successfully",
      data: sellerData,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error  fetching Seller Profile" + error,
    });
  }
};

const updateSellerProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      businessName,
      shopAddress,
      gstNumber,
      accountNumber,
      ifscCode,
    } = req.body;
    const { id } = req.seller;
    const sellerData = await seller.findByIdAndUpdate(id, {
      name,
      email,
      phone,
      businessName,
      shopAddress,
      gstNumber,
      accountNumber,
      ifsc_code: ifscCode,
    });
    if (!sellerData) {
      return res.status(404).json({ message: "Seller not Found" });
    }
    return res.status(200).json({
      message: " Seller Profile Updated Successfully",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error UpDate Seller Profile -> " + error });
  }
};

const deleteSellerProfile = async (req, res) => {
  try {
    const { id } = req.seller;
    const sellerdata = await seller.findByIdAndDelete(id);
    if (!sellerdata) {
      return res.status(404).json({ message: "Seller Not Found" });
    }
    return res
      .status(200)
      .json({ message: "Seller Profile Deleted Successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error Deleting Seler -> " + error });
  }
};

const logOutSeller = async (req, res) => {
  try {
    const { id } = req.seller;
    const sellerdata = await seller.findById(id);
    if (!sellerdata) {
      return res.status(404).json({ message: "Seller Not Found" });
    }
    const token = res.clearCookie("seller_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res.status(200).json({ message: "LogOut Successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error LogOut Seller -> " + error });
  }
};

module.exports = {
  registerSeller,
  loginSeller,
  sellerProfile,
  updateSellerProfile,
  deleteSellerProfile,
  logOutSeller,
};
