import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// basic configurations
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// cors configurations
//
// The deployed frontend and local dev server are always allowed. CORS_ORIGIN adds
// to that list rather than replacing it, so a stale or half-filled dashboard value
// can never lock out the real frontend.
//
// Browsers send Origin with no trailing slash, so a configured value like
// "https://foo.vercel.app/" would silently never match. Normalise both sides.
const normalizeOrigin = (value) => value.trim().replace(/\/+$/, "");

const allowedOrigins = [
  "https://project-camp-fnza.vercel.app",
  "http://localhost:5173",
  ...(process.env.CORS_ORIGIN?.split(",") ?? []),
]
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // No Origin header: same-origin, curl, or a server-to-server call. Allow.
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }

      // Log the rejection so a misconfigured origin is visible in Render's logs
      // instead of surfacing only as an opaque CORS error in the browser.
      console.warn(
        `CORS: blocked origin ${origin}. Allowed: ${allowedOrigins.join(", ")}`,
      );
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//  import the routes

import healthCheckRouter from "./routes/healthcheck.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";
import taskRouter from "./routes/task.routes.js";
import noteRouter from "./routes/note.routes.js";

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/projects", projectRouter);
app.use("/api/v1/tasks", taskRouter);
app.use("/api/v1/notes", noteRouter);

// Global error handler. Must be registered after all routes.
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log the actual error for debugging.
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    statusCode,
    data: null,
    message,
    success: false,
    errors: err.errors || [],
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to basecampy");
});

export default app;
