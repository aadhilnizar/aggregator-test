import { createApp } from "./app.js";
import { config } from "./config.js";
import { prisma } from "./prisma.js";

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`OrderHub API → http://localhost:${config.port}/api  [${config.isProd ? "production" : "development"}]`);
});

// Graceful shutdown: stop accepting connections, then close the DB pool.
async function shutdown(signal) {
  console.log(`\n${signal} received — shutting down…`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
  // Force-exit if it hangs.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
