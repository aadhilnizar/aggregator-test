import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
  statusSchema,
  listQuerySchema,
} from "./restaurants.schemas.js";
import * as ctrl from "./restaurants.controller.js";

export const restaurantsRouter = Router();

// Every restaurant route requires a logged-in user.
restaurantsRouter.use(requireAuth);

restaurantsRouter.get("/", validate(listQuerySchema, "query"), asyncHandler(ctrl.list));
restaurantsRouter.get("/:id", asyncHandler(ctrl.getOne));

restaurantsRouter.post(
  "/",
  requireRole("ADMIN", "RESTAURANT"),
  validate(createRestaurantSchema),
  asyncHandler(ctrl.create)
);

restaurantsRouter.patch(
  "/:id",
  requireRole("ADMIN", "RESTAURANT"),
  validate(updateRestaurantSchema),
  asyncHandler(ctrl.update)
);

restaurantsRouter.patch(
  "/:id/status",
  requireRole("ADMIN", "RESTAURANT"),
  validate(statusSchema),
  asyncHandler(ctrl.setStatus)
);
