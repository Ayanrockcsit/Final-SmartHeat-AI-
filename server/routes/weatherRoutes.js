import express from "express";
import { getCurrentHeat, getHeatForecast, searchHeatLocations } from "../controllers/heatController.js";

const router = express.Router();
router.get("/current", getCurrentHeat);
router.get("/forecast", getHeatForecast);
router.get("/search", searchHeatLocations);

export default router;
