const express = require("express");
const router = express.Router();

const {
  registerSeller,
  loginSeller,
  sellerProfile,
  updateSellerProfile,
  deleteSellerProfile,
  logOutSeller,
} = require("../controllers/sellerController");

const { authenticateSeller } = require("../middleware/auth");

router.post("/register", registerSeller);
router.post("/login", loginSeller);
router.get("/profile/:id", authenticateSeller, sellerProfile);
router.patch("/updateprofile", authenticateSeller, updateSellerProfile);
router.delete("/deleteseller", authenticateSeller, deleteSellerProfile);
router.post("/logout", authenticateSeller, logOutSeller);

module.exports = router;