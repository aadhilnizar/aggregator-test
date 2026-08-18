import { Router } from "express";

import { asyncHandler } from "../../lib/async-handler.js";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import { registerSchema, loginSchema, refreshSchema } from "./auth.schemas.js";
import { register, login, refresh, me } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(register));
authRouter.post("/login", validate(loginSchema), asyncHandler(login));
authRouter.post("/refresh", validate(refreshSchema), asyncHandler(refresh));
authRouter.get("/me", requireAuth, asyncHandler(me));
