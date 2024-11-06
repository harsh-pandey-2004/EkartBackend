const Product = require("../models/productModel");

const addProduct = async (req, res) => {
  try {
    const { name, description, price, quantity, imageUrl } = req.body;

    const newProduct = new Product({
      name,
      description,
      price,
      quantity,
      imageUrl,
    });
    const product = await newProduct.save();
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "Error while adding product",
      });
    }
    return res
      .status(201)
      .json({ success: true, message: "Product added successfully" });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Error adding product: " + error.message,
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching products: " + error.message,
    });
  }
};

const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, quantity, imageUrl } = req.body;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, description, price, quantity, imageUrl },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedProduct) {
      return res.status(404).send("Product not found");
    }
    return res.send("Product updated successfully");
  } catch (error) {
    return res.status(400).send("Error updating product: " + error.message);
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error - " + err.message,
    });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).send("Product not found");
    }
    return res.send("Product deleted successfully");
  } catch (error) {
    return res.status(400).send("Error deleting product: " + error.message);
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  updateProduct,
  getProduct,
  deleteProduct,
};

// // src/components/ProductDetails.js
// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";

// const ProductDetails = () => {
//   const { id } = useParams(); // Get product ID from route parameters
//   const [product, setProduct] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const response = await axios.get(`/api/product/${id}`);
//         setProduct(response.data.data);
//       } catch (err) {
//         setError("Error fetching product details.");
//       }
//     };

//     fetchProduct();
//   }, [id]);

//   if (error) return <p>{error}</p>;

//   return (
//     <div>
//       {product ? (
//         <div>
//           <h2>{product.name}</h2>
//           <p>Description: {product.description}</p>
//           <p>Price: ${product.price}</p>
//           <p>Quantity: {product.quantity}</p>
//           <img src={product.imageUrl} alt={product.name} style={{ width: "200px" }} />
//         </div>
//       ) : (
//         <p>Loading product details...</p>
//       )}
//     </div>
//   );
// };

// export default ProductDetails;
