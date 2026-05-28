import { Router } from "express";
import {
  addProduct,
  editProduct,
  getProducts,
  removeProduct,
} from "../controllers/productController.js";

const router = Router();

router.get("/", getProducts);
router.post("/", addProduct);
router.put("/:id", editProduct);
router.delete("/:id", removeProduct);

export default router;
