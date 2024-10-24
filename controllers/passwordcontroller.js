const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const user = require("../models/user");
// require("dotenv").config();
// Request to Change Password
const requestPasswordChange = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).send("User not found");
    }
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const password_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30m",
    });
    res.cookie("pass_token", password_token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    const resetLink = `${process.env.CHANGE_PASSWORD_FRONTEND_URL}/reset-password?token=${password_token}`;
    // console.log(password_token);

    // Send email
    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Change Request",
      text: `Click here to reset your password: ${resetLink}`,
    });

    res.send("Password reset link sent to your email");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error requesting password change" + error.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const userId = req.user.id;

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updateUser = await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    if (!updateUser) {
      return res.status(400).send("Invalid or expired token");
    }
    return res.send("Password successfully changed");
  } catch (error) {
    return res.status(500).json({ message: "Error resetting password" });
  }
};

module.exports = { requestPasswordChange, resetPassword };
