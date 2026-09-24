import express from "express";
import { getRecommendation } from "../controllers/aiController.js";

const router = express.Router();
router.post("/recommendation", getRecommendation);

export default router;
