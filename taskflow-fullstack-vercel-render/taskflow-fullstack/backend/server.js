import express from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow non-browser clients (curl/Postman) and configured frontend origins.
    if (!origin || allowedOrigins.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Origin not allowed by CORS"));
  }
}));

// Demo-only in-memory data. It resets when this process restarts.
let tasks = [
  { id: randomUUID(), title: "Explore the TaskFlow dashboard", completed: false, createdAt: new Date().toISOString() },
  { id: randomUUID(), title: "Connect the frontend to the API", completed: true, createdAt: new Date().toISOString() }
];

app.get("/", (_req, res) => {
  res.json({ message: "TaskFlow API is running", docs: "/api/health" });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "TaskFlow API" });
});

app.get("/api/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/api/tasks", (req, res) => {
  const title = typeof req.body?.title === "string" ? req.body.title.trim() : "";
  if (!title) return res.status(400).json({ message: "Task title is required." });
  if (title.length > 120) return res.status(400).json({ message: "Task title must be 120 characters or fewer." });

  const task = { id: randomUUID(), title, completed: false, createdAt: new Date().toISOString() };
  tasks.unshift(task);
  return res.status(201).json(task);
});

app.patch("/api/tasks/:id", (req, res) => {
  const task = tasks.find((item) => item.id === req.params.id);
  if (!task) return res.status(404).json({ message: "Task not found." });
  task.completed = !task.completed;
  return res.json(task);
});

app.delete("/api/tasks/:id", (req, res) => {
  const existingLength = tasks.length;
  tasks = tasks.filter((item) => item.id !== req.params.id);
  if (tasks.length === existingLength) return res.status(404).json({ message: "Task not found." });
  return res.status(204).end();
});

app.use((err, _req, res, _next) => {
  console.error(err.message);
  if (err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ message: "This frontend origin is not allowed by the API." });
  }
  return res.status(500).json({ message: "Unexpected server error." });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`TaskFlow API listening on port ${PORT}`);
});
