import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import cron from "node-cron";

import { connectDB } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

import authRoutes from "./routes/authRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";
import heatRoutes from "./routes/heatRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { sweepAndCreateAlerts } from "./controllers/alertController.js";
import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const clientDistPath = path.resolve(__dirname, "../client/dist");

const _dirname=path.resolve();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "SmartHeat AI API running", demoMode: process.env.DEMO_MODE === "true" });
});

app.use("/api/auth", authRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/heat", heatRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
// if (fs.existsSync(clientDistPath)) {
//   app.use(express.static(clientDistPath));
//   app.use((req, res, next) => {
//     if (req.method === "GET" && !req.path.startsWith("/api")) {
//       return res.sendFile(path.join(clientDistPath, "index.html"));
//     }
//     next();
//   });
// }

// app.use(notFound);
// app.use(errorHandler);

app.use(express.static(path.join(_dirname, "/client/dist")));
app.get('{/*splat}',(_,res)=> {
  res.sendFile(path.resolve(_dirname, "client", "dist", "index.html"));
})

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`SmartHeat AI server running on port ${PORT} (DEMO_MODE=${process.env.DEMO_MODE})`);
  });

  // Risk API runs every 10 minutes: sweeps monitored locations and raises
  // new alerts, deduped per location/type/severity/day (see alertService.js).
  cron.schedule("*/10 * * * *", async () => {
    try {
      const created = await sweepAndCreateAlerts();
      if (created.length) console.log(`Alert sweep: ${created.length} new alert(s) created`);
    } catch (err) {
      console.error("Alert sweep failed:", err.message);
    }
  });
}

start();
