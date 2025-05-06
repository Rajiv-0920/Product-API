import mongoose from "mongoose";
import Product from "../models/product.model.js";
import cloudinary from "../lib/cloudinary.js";

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Error in fetching product: ", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const product = await Product.find();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.log("Error in fetching products: ", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

import streamifier from "streamifier";

export const createProduct = async (req, res) => {
  const { name, price } = req.body;
  const image = req.file;

  try {
    if (!name || !price || !image) {
      return res.status(404).json({
        success: false,
        message: "Please provide all the fields.",
      });
    }

    const streamUpload = (fileBuffer) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) resolve(result);
          else reject(error);
        });
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const uploadResponse = await streamUpload(image.buffer); // ← correct way
    const imageUrl = uploadResponse.secure_url;

    const newProduct = new Product({
      name,
      price,
      image: imageUrl,
    });

    await newProduct.save();

    res.status(200).json({ success: true, data: newProduct });
  } catch (error) {
    console.log("Error in Post (/products) Route: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const image = req.file;
  console.log(updates);
  console.log(req.body);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Product Id" });
  }

  try {
    let imageUrl;

    // If new image is provided, upload it
    if (image) {
      const streamUpload = (buffer) => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream((err, result) => {
            if (result) resolve(result);
            else reject(err);
          });
          streamifier.createReadStream(buffer).pipe(stream);
        });
      };

      const uploadResult = await streamUpload(image.buffer);
      imageUrl = uploadResult.secure_url;
    }

    // Include image only if a new one was uploaded
    if (imageUrl) {
      updates.image = imageUrl;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.log("Error in patch (/products/:id) Route: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid Product Id" });
  }

  try {
    await Product.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    console.log("Error in Delete (/products/:id) Route: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export const deleteProducts = async (req, res) => {
  try {
    // Delete all products from the database
    await Product.deleteMany({});

    res
      .status(200)
      .json({ success: true, message: "All products have been deleted." });
  } catch (error) {
    console.log("Error in DELETE (/products) Route: ", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};
