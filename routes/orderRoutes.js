const express = require("express");
const {
  placeOrdercart,
  verifyOrder,
  placeOrderProduct,
} = require("../controllers/orderController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/productorder", authenticateToken, placeOrderProduct);
router.post("/cartorder", authenticateToken, placeOrdercart);
router.get("/verify/:orderId/:success", authenticateToken, verifyOrder);

module.exports = router;
