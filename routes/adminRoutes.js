const express = require("express");
const router = express.Router();
const {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getallUsers,
  getallSellers,
  getallProducts,
  getallOrders,
} = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/adminAuth");

router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", authenticateAdmin, logoutAdmin);
router.get("/getusers", authenticateAdmin, getallUsers);
router.get("/getsellers", authenticateAdmin, getallSellers);
router.get("/getproducts", authenticateAdmin, getallProducts);
router.get("/getorders", authenticateAdmin, getallOrders);

module.exports = router;
