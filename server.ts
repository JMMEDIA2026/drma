import 'dotenv/config';
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import adminSettingsHandler from "./api/admin/settings";
import authSignupHandler from "./api/auth/signup";
import authLoginHandler from "./api/auth/login";
import authMembersHandler from "./api/auth/members";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 8844;

  app.use(express.json());

  // Use the same MongoDB-backed routes locally that Vercel serves from api/.
  app.all("/api/admin/settings", (req, res) => adminSettingsHandler(req, res));
  app.all("/api/auth/signup", (req, res) => authSignupHandler(req, res));
  app.all("/api/auth/login", (req, res) => authLoginHandler(req, res));
  app.all("/api/auth/members", (req, res) => authMembersHandler(req, res));

  // In-memory cache for API requests
  let cachedData: any = null;
  let cacheTimestamp = 0;
  const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  // Proxy endpoint to DramaBox latest API
  app.get("/api/dramabox/latest", async (req, res) => {
    const lang = (req.query.lang as string) || "ko";
    try {
      const response = await fetch(`https://puruboy-api.vercel.app/api/dramabox/home`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
          "Accept": "application/json"
        }
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({ success: true, data: data.data || data, source: "puruboy-home" });
      }
    } catch (e) {
      // fallback to sansekai or cached
    }

    try {
      const response = await fetch(`https://api.sansekai.my.id/api/dramabox/latest?lang=${encodeURIComponent(lang)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36",
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return res.json({ success: true, data, source: "live" });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || "Failed to fetch from DramaBox API" });
    }
  });

  // Proxy for Puruboy DramaBox Category API (/api/dramabox/category)
  app.get("/api/proxy/dramabox/category", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://puruboy-api.vercel.app/api/dramabox/category${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy for Puruboy DramaBox Detail API (/api/dramabox/detail)
  app.get("/api/proxy/dramabox/detail", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://puruboy-api.vercel.app/api/dramabox/detail${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy for Puruboy DramaBox Home API (/api/dramabox/home)
  app.get("/api/proxy/dramabox/home", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://puruboy-api.vercel.app/api/dramabox/home${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy for Puruboy DramaBox Stream API (/api/dramabox/stream)
  app.get("/api/proxy/dramabox/stream", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://puruboy-api.vercel.app/api/dramabox/stream${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy for Puruboy DramaBox Search API (/api/dramabox/search)
  app.get("/api/proxy/dramabox/search", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://puruboy-api.vercel.app/api/dramabox/search${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Proxy for SoundCloud Search API (/api/search/soundcloud)
  app.get("/api/proxy/search/soundcloud", async (req, res) => {
    try {
      const queryString = new URLSearchParams(req.query as any).toString();
      const url = `https://puruboy-api.vercel.app/api/search/soundcloud${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0", "Accept": "application/json" }
      });
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`JmBox Streaming Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
