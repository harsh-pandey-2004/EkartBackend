// routes/productRoutes.js
const express = require("express");
const {
  addProduct,
  getAllProducts,
  updateProduct,
  getProduct,
  deleteProduct,
} = require("../controllers/productController");
const authenticateToken = require("../middleware/auth"); // Optional: authentication middleware

const router = express.Router();

router.post("/add", addProduct); // Add a product
router.get("/listproducts", getAllProducts); // Get all products
router.put("/update/:id", updateProduct); // Update a product by ID
router.get("/product/:id", getProduct);
router.delete("/delete/:id", deleteProduct); // Delete a product by ID

module.exports = router;
