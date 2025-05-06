import express from "express";
import {
  createProduct,
  deleteProduct,
  deleteProducts,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", upload.single("image"), createProduct);
router.patch("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);
router.delete("/", deleteProducts);
export default router;
