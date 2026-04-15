import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import authRouter from "../routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

// ── Routes ───────────────────────────────────────────────────────────────────
import developerRouter from "../routes/developer.routes.js";

app.use("/api/auth", authRouter);
app.use("/api/developer", developerRouter);

// ── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`[ERROR] ${statusCode} - ${message}`);
  return res.status(statusCode).json({ message });
});

export default app;