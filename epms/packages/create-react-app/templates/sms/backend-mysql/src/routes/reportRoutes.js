import { Router } from "express";
import {
  customerPurchases,
  dailySales,
  dashboardSummary,
  monthlySales,
  productStock,
} from "../controllers/reportController.js";

const router = Router();

router.get("/dashboard", dashboardSummary);
router.get("/daily-sales", dailySales);
router.get("/monthly-sales", monthlySales);
router.get("/product-stock", productStock);
router.get("/customer-purchases", customerPurchases);

export default router;
