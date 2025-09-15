// api/index.js  (ESM, no top-level Prisma)
// Minimal Express with safe router mounting.

import express from "express";
import cors from "cors";

const app = express();

// Basic middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Always-on health & debug (these must never crash)
app.get("/api/health", (req, res) => {
  return res.status(200).json({ ok: true, message: "API alive (core)" });
});
app.get("/api/debug/hello", (req, res) => {
  return res.json({ ok: true, msg: "debug hello" });
});
app.post("/api/debug/ping", (req, res) => {
  return res.json({ ok: true, body: req.body ?? null });
});

// Try to mount real routers, but don't die if something fails.
// This keeps health/debug working while we diagnose.
async function mountRouters() {
  try {
    const { default: authRouter } = await import("../src/routes/auth.routes.js");
    app.use("/api/auth", authRouter);
  } catch (e) {
    console.error("Auth router failed to mount:", e);
  }

  try {
    const { default: usersRouter } = await import("../src/routes/user.routes.js");
    app.use("/api/users", usersRouter);
  } catch (e) {
    console.error("Users router failed to mount:", e);
  }

  try {
    const { default: postsRouter } = await import("../src/routes/posts.routes.js");
    app.use("/api/posts", postsRouter);
  } catch (e) {
    console.error("Posts router failed to mount:", e);
  }
}
await mountRouters();

// Export handler for Vercel
export default app;
