const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  verifyAdmin,
  logoutAdmin,
  getallUsers,
  getallSellers,
  getallProducts,
  getallOrders,
  getallRequests,
} = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/adminAuth");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/verify", authenticateAdmin, verifyAdmin);
router.post("/logout", logoutAdmin);
router.get("/getusers", authenticateAdmin, getallUsers);
router.get("/getsellers", authenticateAdmin, getallSellers);
router.get("/getproducts", authenticateAdmin, getallProducts);
router.get("/getorders", authenticateAdmin, getallOrders);
router.get("/getrequests", authenticateAdmin, getallRequests);

module.exports = router;
