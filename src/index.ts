import cors from "cors";
import type { Express, NextFunction, Request, Response } from "express";
import express from "express";
import morgan from "morgan";
import BlogRouter from "./routes/blog.routes.ts";
import { PORT } from "./secrets.ts";
const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // বিস্তারিত Apache style লগ

app.use(
  cors({
    origin: ["http://localhost:8800"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    credentials: true,
  })
);

app.get("/", (_, res: Response) => {
  res.send("Server is Running");
});

app.get("/health", (_, res: Response) => {
  res.json({
    success: true,
    message: "Server Running.",
    time: new Date().toDateString(),
  });
});

// routes
app.use("/api", BlogRouter);

// error handling

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// DATABASE_URL="postgres://6d4f6b0e8f54d4416b0761e670466bdba6fafcf65471510f09d3dcf9d51a7046:sk_OGiJvjdkcuWdxehWWIJR7@db.prisma.io:5432/postgres?sslmode=require"
