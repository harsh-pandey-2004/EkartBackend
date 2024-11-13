const user = require("../models/user");

const addtoWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const wishlistData = userData.WishlistItems;

    let findKey = wishlistData.find(
      (item) => item?.productId && item.productId.toString() === productId
    );

    if (findKey) {
      return res.status(200).json({ message: "Product already in wishlist" });
    }
    wishlistData.push({ productId });

    await user.findByIdAndUpdate(
      userId,
      { WishlistItems: wishlistData },
      { new: true }
    );
    // console.log(wishlistData);
    return res.status(201).json({ message: "Product Added to Wishlist" });
  } catch (error) {
    return res.status(500).json({ message: "Add Wishlist :" + error.message });
  }
};

const listWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const userData = await user
      .findById(userId)
      .select("WishlistItems")
      .populate("WishlistItems.productId");
    if (!userData) {
      return res.status(404).json({ message: "Data not found" });
    }
    return res.status(200).json({
      message: "Wishlist Items",
      data: userData.WishlistItems,
    });
  } catch (error) {
    return res.status(500).json({ message: "Wishlist : " + error.message });
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    const removeArr = userData.WishlistItems.filter(
      (item) => String(item?.productId) !== productId
    );
    const findKey = userData.WishlistItems.find(
      (item) => String(item?.productId) === productId
    );
    if (!findKey) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }
    await user.findByIdAndUpdate(
      userId,
      { WishlistItems: removeArr },
      { new: true }
    );
    return res.status(200).json({ message: "Product removed from Wishlist" });
    // const index = userData.WishlistItems.findIndex(
    //   (item) => item?.productId.toString() == productId
    // );
    // if (index !== -1) {
    //   userData.WishlistItems.splice(index, 1);
    //   await user.findByIdAndUpdate(
    //     userId,
    //     { WishlistItems: userData.WishlistItems },
    //     {
    //       new: true,
    //     }
    //   );
    //   return res.status(200).json({ message: "Product removed from Wishlist" });
    // } else {
    //   return res.status(404).json({ message: "Product not found in Wishlist" });
    // }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { addtoWishlist, listWishlist, deleteWishlistItem };
