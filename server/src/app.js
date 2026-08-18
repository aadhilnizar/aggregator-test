import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";

import { config } from "./config.js";
import { authLimiter, apiLimiter } from "./middleware/rate-limit.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { restaurantsRouter } from "./modules/restaurants/restaurants.routes.js";
import { notFoundHandler, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  // Behind a proxy/load balancer in production (correct client IPs for rate limiting).
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(compression());
  app.use(cors({ origin: config.webOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan(config.isProd ? "combined" : "dev"));

  // Health check (unauthenticated, unthrottled).
  app.get("/api/health", (_req, res) => res.json({ status: "ok", service: "orderhub-api" }));

  // Global safety ceiling, then per-area routers.
  app.use("/api", apiLimiter);
  app.use("/api/auth", authLimiter, authRouter);
  app.use("/api/restaurants", restaurantsRouter);

  // Fallbacks (must be last).
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
