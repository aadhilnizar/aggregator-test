import { badRequest } from "../lib/http-error.js";

/**
 * Validate a request part (`body` | `query` | `params`) against a Zod schema.
 * On success, replaces the request part with the parsed/coerced data.
 */
export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const msg = result.error.issues
      .map((i) => `${i.path.join(".") || source}: ${i.message}`)
      .join("; ");
    return next(badRequest(msg));
  }
  req[source] = result.data;
  next();
};
