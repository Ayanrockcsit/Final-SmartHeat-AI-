import express from "express";
import { getCurrentHeat, getHeatRisk, getHeatForecast, getHeatMap } from "../controllers/heatController.js";

const router = express.Router();
router.get("/current", getCurrentHeat);
router.get("/risk", getHeatRisk);
router.get("/forecast", getHeatForecast);
router.get("/map", getHeatMap);

export default router;
