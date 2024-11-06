const express = require("express");

const {
  registerUser,
  loginUser,
  logOutUser,
  deleteUser,
  updateProfile,
  userProfile,
} = require("../controllers/userController");

const {
  requestPasswordChange,
  resetPassword,
} = require("../controllers/passwordcontroller");

const {
  addtoCart,
  listCartItems,
  removeCartItems,
} = require("../controllers/CartController");
const { authenticateToken, password_auth } = require("../middleware/auth");

const {
  listWishlist,
  addtoWishlist,
  deleteWishlistItem,
} = require("../controllers/WishlistController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logOutUser);
router.delete("/delete", authenticateToken, deleteUser);
router.get("/profile/:id", authenticateToken, userProfile);
router.patch("/updateprofile", authenticateToken, updateProfile);
router.post(
  "/request-password-change",
  authenticateToken,
  requestPasswordChange
);
router.put("/reset-password/:token", password_auth, resetPassword);

router.post("/addtocart", authenticateToken, addtoCart);
router.get("/cartitems", authenticateToken, listCartItems);
router.delete("/deletecartItem", authenticateToken, removeCartItems);

router.post("/addtowishlist", authenticateToken, addtoWishlist);
router.get("/wishlist", authenticateToken, listWishlist);
router.delete("/removefromwishlist", authenticateToken, deleteWishlistItem);

module.exports = router;
