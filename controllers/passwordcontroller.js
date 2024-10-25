const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const user = require("../models/user");
// require("dotenv").config();
// Request to Change Password
// const requestPasswordChange = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const user = await User.findOne({ email });

//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     const password_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30m",
//     });

//     const resetLink = `${process.env.CHANGE_PASSWORD_FRONTEND_URL}?token=${password_token}`;
//     // console.log(password_token);

//     // Send email
//     await transporter.sendMail({
//       to: email,
//       from: process.env.EMAIL_USER,
//       subject: "Password Change Request",
//       text: `Click here to reset your password: ${resetLink}`,
//     });

//     return res.json({
//       message: "Password reset link sent to your email",
//       data: password_token,
//     });
//   } catch (error) {
//     return res
//       .status(500)
//       .json({ message: "Error requesting password change" + error.message });
//   }
// };
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

    // Save the token in the database with a 30-minute expiration
    await PasswordResetToken.create({
      userId: id,
      token: passwordToken,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 30 minutes from now
    });

    // Send email
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
    // 1. Find the token in the database
    const tokenDoc = await PasswordResetToken.findOne({ token });

    // 2. Check if the token is valid and not expired
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      return res.status(400).send("Invalid or expired token");
    }

    // 3. Find the user associated with the token
    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // 4. Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 5. Update the user's password
    user.password = hashedPassword;
    await user.save();

    // 6. Delete the token after successful password update
    await PasswordResetToken.findByIdAndDelete(tokenDoc._id);

    return res.send("Password successfully changed");
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error resetting password: " + error.message });
  }
};

module.exports = { requestPasswordChange, resetPassword };
