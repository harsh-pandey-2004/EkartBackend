const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const { authenticateToken } = require("./middleware/auth");
const cors = require("cors");
const cookie = require("cookie-parser");

const app = express();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookie());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/users", userRoutes);
app.use("/products", productRoutes);
app.use("/orders", orderRoutes);
app.use("/sellers", sellerRoutes);
app.get("/protected", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "You have access to this protected route",
    user: req.user,
  });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
