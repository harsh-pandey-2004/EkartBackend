const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const user = require("../models/user");

const PasswordResetToken = require("../models/passwordResetToken");

const requestPasswordChange = async (req, res) => {
  try {
    const { id } = req.user;
    const userData = await User.findById(id);
    const { email } = userData;

    if (!userData) {
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

    const passwordToken = jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "5m",
    });

    const resetLink = `${process.env.CHANGE_PASSWORD_FRONTEND_URL}?token=${passwordToken}`;

    await PasswordResetToken.create({
      userId: id,
      token: passwordToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Password Change Request",
      text: `Click here to reset your password: ${resetLink}`,
    });

    return res.json({
      message: "Password reset link sent to your email",
      data: passwordToken,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error requesting password change" + error.message });
  }
};

// Reset Password
// const resetPassword = async (req, res) => {
//   try {
//     const { newPassword } = req.body;
//     const userId = req.user.id;

//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     const updateUser = await User.findByIdAndUpdate(userId, {
//       password: hashedPassword,
//     });
//     if (!updateUser) {
//       return res.status(400).send("Invalid or expired token");
//     }
//     password_token = "";
//     // res.cookie("pass_token", "", {
//     //   httpOnly: true,
//     //   secure: true,
//     //   sameSite: "none",
//     // });
//     return res.send("Password successfully changed");
//   } catch (error) {
//     return res.status(500).json({ message: "Error resetting password" });
//   }
// };
const resetPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { token } = req.params;
    console.log(token, newPassword);
    const tokenDoc = await PasswordResetToken.findOne({ token });

    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).send("Invalid or expired token");
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await PasswordResetToken.findByIdAndDelete(tokenDoc._id);

    return res.send("Password successfully changed");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting password: " + error.message });
  }
};

module.exports = { requestPasswordChange, resetPassword };
