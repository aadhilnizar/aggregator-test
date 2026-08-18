import "dotenv/config";

const isProd = process.env.NODE_ENV === "production";

const accessSecret = process.env.JWT_ACCESS_SECRET || "dev-access-secret";
const refreshSecret = process.env.JWT_REFRESH_SECRET || "dev-refresh-secret";

// Fail fast in production if critical secrets are missing or left at defaults.
if (isProd) {
  const problems = [];
  if (!process.env.DATABASE_URL) problems.push("DATABASE_URL is not set");
  if (!process.env.JWT_ACCESS_SECRET || accessSecret === "dev-access-secret")
    problems.push("JWT_ACCESS_SECRET must be set to a strong value");
  if (!process.env.JWT_REFRESH_SECRET || refreshSecret === "dev-refresh-secret")
    problems.push("JWT_REFRESH_SECRET must be set to a strong value");
  if (problems.length) {
    throw new Error(`Refusing to start in production:\n - ${problems.join("\n - ")}`);
  }
}

export const config = {
  isProd,
  port: Number(process.env.PORT) || 4000,
  webOrigin: (process.env.WEB_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  jwt: {
    accessSecret,
    refreshSecret,
    accessTtl: "15m",
    refreshTtl: "7d",
  },
};
