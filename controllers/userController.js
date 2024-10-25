const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a  new user
const registerUser = async (req, res) => {
  try {
    const { name, lastname, phone, address, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      lastname,
      phone,
      address,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error - " + error,
    });
  }
};

//  Login a User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.json({
      message: "Loggedin Successfully",
      data: user._id,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Error - " + err,
    });
  }
};

// Get User profile
const userProfile = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(req.cookies.auth_token);

    const userData = await User.findById(id).select("-password");
    if (!userData) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    return res.status(200).json({ data: userData });
  } catch (error) {
    return res.status(500).json({
      meaage: "error in profile " + error.message,
    });
  }
};

// Update User
const updateProfile = async (req, res) => {
  try {
    const { id } = req.user;
    const { email, name, lastname, phone, address } = req.body;
    const userData = await User.findByIdAndUpdate(
      id,
      { name, lastname, phone, address, email },
      { new: true, runValidators: true }
    );

    if (!userData) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json({
      message: " Profile updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error in Update Profile Module " + error,
    });
  }
};

// Logout User
const logOutUser = async (req, res) => {
  try {
    const token = res.clearCookie("auth_token", "", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    // res.json({ token });
    res.json({ message: "Logout Sucessfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Error in Logout Module " + err,
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.user;
    const deleteaccount = await User.findByIdAndDelete(id);

    if (!deleteaccount) {
      return res.status(400).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    // console.log("a");
    return res.status(500).json({
      message: "Error in Delete Module " + error,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logOutUser,
  deleteUser,
  updateProfile,
  userProfile,
};
