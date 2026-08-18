import { verifyAccess } from "../lib/jwt.js";
import { unauthorized, forbidden } from "../lib/http-error.js";
import { prisma } from "../prisma.js";

/** Require a valid access token; attaches the current user to req.user. */
export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");
    if (scheme !== "Bearer" || !token) throw unauthorized("Missing bearer token");

    const payload = verifyAccess(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) throw unauthorized("User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return next(unauthorized("Invalid or expired token"));
    }
    next(err);
  }
}

/** Require the current user to hold one of the given roles. */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(unauthorized());
  if (!roles.includes(req.user.role)) return next(forbidden("Insufficient role"));
  next();
};
