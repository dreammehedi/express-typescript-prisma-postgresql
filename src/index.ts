import { PrismaClient } from "@prisma/client";
import cors from "cors";
import dotenv from "dotenv";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import BlogRouter from "./routes/blog.routes.ts";
import { PORT } from "./secrets.ts";

dotenv.config();

const prisma = new PrismaClient();

// Configure __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app: Express = express();

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Validate environment
const requiredEnvVars = ["NODE_ENV", "PORT", "DATABASE_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// CORS
const allowedOrigins = ["http://localhost:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "CORS policy does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// ✅ Home route (EJS view)
app.get("/", (_, res: Response) => {
  res.render("index", {
    title: "Home",
    message: "School Management System (SMS) Server Running...",
  });
});

// Health route
app.get("/health", (_, res: Response) => {
  res.render("health", {
    title: "Server Health",
    success: true,
    message: "Server Running.",
    time: new Date().toISOString(),
  });
});

// API routes
app.use("/api", BlogRouter);

// ✅ 404 (EJS error page)
app.use((req, res) => {
  res.status(404).render("error", {
    title: "404 - Not Found",
    message: "The page you're looking for doesn't exist.",
  });
});

// ✅ API error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);

  if (err.code?.startsWith("P")) {
    return res.status(400).json({
      success: false,
      status: 400,
      message: "Database operation failed",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      status: 401,
      message: "Invalid token",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    status: err.status || 500,
    message: err.message || "Something went wrong!",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("Received shutdown signal");
  server.close(async () => {
    console.log("Server closed");
    try {
      await prisma.$disconnect();
      console.log("Database connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Error during shutdown:", error);
      process.exit(1);
    }
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown();
});
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  gracefulShutdown();
});
