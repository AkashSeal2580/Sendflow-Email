
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDatabase } from "./config/database";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log("-----------------------------------");
      console.log("SendFlow Backend Started");
      console.log(`API: http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log("-----------------------------------");
    });

    server.on("error", (error) => {
      console.error("Server error:", error);
      process.exit(1);
    });

    process.on("SIGINT", () => {
      console.log("Server shutting down...");
      server.close(() => process.exit(0));
    });

    process.on("SIGTERM", () => {
      console.log("Server shutting down...");
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
}

startServer();
