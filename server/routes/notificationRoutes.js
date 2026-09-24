import express from "express";
import { listNotifications, sendTestNotification } from "../controllers/notificationController.js";

const router = express.Router();
router.get("/", listNotifications);
router.post("/test", sendTestNotification);

export default router;
