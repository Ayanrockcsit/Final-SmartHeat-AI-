import express from "express";
import { listAlerts, listAlertsForLocation } from "../controllers/alertController.js";

const router = express.Router();
router.get("/", listAlerts);
router.get("/location/:location", listAlertsForLocation);

export default router;
