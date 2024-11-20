const express = require("express");
const {
  placeOrdercart,
  verifyOrder,
  placeOrderProduct,
} = require("../controllers/orderController");
const {
  requestReturnReplacement,
  updateRequestStatus,
} = require("../controllers/returnReplacementController");
const { authenticateToken, authenticateSeller } = require("../middleware/auth");

const router = express.Router();

router.post("/productorder", authenticateToken, placeOrderProduct);
router.post("/cartorder", authenticateToken, placeOrdercart);
router.get("/verify/:orderId/:success", authenticateToken, verifyOrder);

router.post("/return", authenticateToken, requestReturnReplacement);
router.post(
  "/verify-return-replacement",
  authenticateSeller,
  updateRequestStatus
);

module.exports = router;
