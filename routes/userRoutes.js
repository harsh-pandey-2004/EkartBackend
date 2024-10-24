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

router.post("/register", registerUser); // Add a User
router.post("/login", loginUser); // Login for user
router.post("/logout", logOutUser); // Logout User
router.delete("/delete", authenticateToken, deleteUser); // Delete User
router.get("/profile/:id", authenticateToken, userProfile); // View User Profile
router.patch("/updateprofile", authenticateToken, updateProfile); // Commit Updates On User profile
router.post(
  "/request-password-change",
  authenticateToken,
  requestPasswordChange
); // Request to Change Password for User Account
router.put("/reset-password", password_auth, resetPassword); // Change Password

router.post("/addtocart", authenticateToken, addtoCart); // Add Item to Cart
router.get("/cartitems", authenticateToken, listCartItems); // List Cart Items
router.delete("/deletecartItem", authenticateToken, removeCartItems); // Delete Cart Item

router.post("/addtowishlist", authenticateToken, addtoWishlist); // Add Item to Wishlist
router.get("/wishlist", authenticateToken, listWishlist); //  List Wishlist Items
router.delete("/removefromwishlist", authenticateToken, deleteWishlistItem);

module.exports = router;
