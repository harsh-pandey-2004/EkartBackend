const user = require("../models/user");

const addtoCart = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId)
      return res.status(400).json({ message: "Product ID is required" });
    const id = req.user.id;
    const userData = await user.findById(id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const cartdata = userData.cartItems;

    let findKey = cartdata.find(
      (item) => item?.productId.toString() === productId
    );

    if (findKey) {
      findKey.quantity += 1;
    } else {
      cartdata.push({
        productId,
        quantity: 1,
      });
    }

    const check = await user.findByIdAndUpdate(
      id,
      { cartItems: cartdata },
      { new: true }
    );
    return res.status(201).json({ message: "Product Added to Cart" });
  } catch (error) {
    return res.status(404).json({
      message: "Product not Found" + error,
    });
  }
};

const listCartItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await user
      .findById(userId)
      .select("cartItems")
      .populate("cartItems.productId");
    if (!userData) {
      return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json({
      message: "Cart Items",
      data: userData.cartItems,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching cart items" + error,
    });
  }
};

const removeCartItems = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const removeArr = userData.cartItems.filter(
      (item) => String(item?.productId) !== productId
    );
    const findKey = userData.cartItems.find(
      (item) => String(item?.productId) === productId
    );
    if (!findKey) {
      return res.status(404).json({ message: "Product not found in cart" });
    }
    await user.findByIdAndUpdate(
      userId,
      { cartItems: removeArr },
      { new: true }
    );
    return res.status(200).json({ message: "Product removed from cart" });
    // if (index !== -1) {
    //   userData.cartItems.splice(index, 1);

    // } else {
    //   return res.status(404).json({ message: "Product not found in cart" });
    // }
  } catch (error) {
    return res.status(500).json({
      message: "Error removing cart items" + error,
    });
  }
};

module.exports = { addtoCart, listCartItems, removeCartItems };

// user.findById(id).select("cartData").populate("cartData.productId");
