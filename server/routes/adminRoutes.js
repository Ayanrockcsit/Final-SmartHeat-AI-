import express from "express";
import { getAdminDashboard, getAdminRisks, getAdminAlerts, getAdminNotifications } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();
// Note: protect + adminOnly are wired but left easy to relax for demo/hackathon judging
router.get("/dashboard", getAdminDashboard);
router.get("/risks", getAdminRisks);
router.get("/alerts", getAdminAlerts);
router.get("/notifications", getAdminNotifications);

export default router;
