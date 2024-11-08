const express = require("express");
const {
  placeOrdercart,
  verifyOrder,
  placeOrderProduct,
} = require("../controllers/orderController");
const {
  requestReturnReplacement,
} = require("../controllers/returnReplacementController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

router.post("/productorder", authenticateToken, placeOrderProduct);
router.post("/cartorder", authenticateToken, placeOrdercart);
router.get("/verify/:orderId/:success", authenticateToken, verifyOrder);

router.post("/return", authenticateToken, requestReturnReplacement);

module.exports = router;
