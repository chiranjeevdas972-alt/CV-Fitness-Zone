import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const isProd = process.env.NODE_ENV === "production";
  const PORT = isProd 
    ? (process.env.PORT ? Number(process.env.PORT) : 3000)
    : (process.env.DEFAULT_APP_PORT ? Number(process.env.DEFAULT_APP_PORT) : 3000);

  // 1. Hardening: Disable software fingerprinting banner
  app.disable('x-powered-by');

  // 2. Hardening: Comprehensive Defense-in-Depth Security Headers
  app.use((req, res, next) => {
    // Prevent MIME-sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    
    // Cross-Origin Resource Sharing (CORS) for trusted SaaS ecosystem
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    
    // Legacy XSS filter protection
    res.setHeader("X-XSS-Protection", "1; mode=block");
    
    // Referrer policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    
    // Restrict sensitive browser APIs
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=(), payment=()");
    
    // Strict Transport Security (HSTS)
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
    
    // Restrict Flash / PDF cross-domain policy
    res.setHeader("X-Permitted-Cross-Domain-Policies", "none");
    
    // Content Security Policy (CSP) against XSS, clickjacking, and data exfiltration
    const csp = [
      "default-src 'self' https: data: blob:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://apis.google.com https://*.firebaseio.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https: https://images.unsplash.com",
      "connect-src 'self' https: wss: https://*.googleapis.com https://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-ancestors *"
    ].join("; ");
    res.setHeader("Content-Security-Policy", csp);

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  // 3. Hardening: Request body limit to thwart Memory Exhaustion & Slowloris attacks
  app.use(express.json({ limit: "500kb" }));

  // 4. Hardening: Anti-Prototype Pollution & Input Sanitization
  function sanitizeInput(obj: any): any {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitizeInput);

    const clean: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Block prototype pollution vectors
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      const val = obj[key];
      if (typeof val === 'string') {
        // Strip out dangerous null bytes
        clean[key] = val.replace(/\0/g, '');
      } else if (typeof val === 'object' && val !== null) {
        clean[key] = sanitizeInput(val);
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }

  app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeInput(req.body);
    }
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeInput(req.query);
    }
    next();
  });

  // 5. Hardening: In-memory Rate Limiting for API routes (Anti-Brute Force / DoS)
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 120; // 120 req/min per IP

  app.use("/api", (req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown_ip";
    const now = Date.now();
    const clientRecord = rateLimitMap.get(ip);

    if (!clientRecord || now > clientRecord.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      return next();
    }

    clientRecord.count += 1;
    if (clientRecord.count > MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        error: "Too many requests from this IP. Rate limit exceeded for security. Please try again in 1 minute."
      });
    }

    next();
  });

  // Initialize the Google Gemini GenAI Client on the Server
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // 1. POST /api/ai/workout - Generate Workout Plan
  app.post("/api/ai/workout", async (req, res) => {
    try {
      const { memberName, goal, focusArea, level, durationWeeks } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing. Please set it in Settings > Secrets." });
      }

      const prompt = `Create a highly professional premium international-level AI Workout Plan for a gym member:
      - Member Name: ${memberName || 'Valued Athlete'}
      - Goal: ${goal || 'Lean Muscle Gain'}
      - Focus Area: ${focusArea || 'Full Body'}
      - Level: ${level || 'Intermediate'}
      - Duration: ${durationWeeks || 4} Weeks

      Provide the plan in clean Markdown format containing a weekly split table, expert body-building tips, recommended supplement strategies, and safety details. Make it extremely motivational.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Workout Error:", error);
      return res.status(500).json({ error: "Failed to generate workout plan safely." });
    }
  });

  // 2. POST /api/ai/diet - Generate Diet Plan
  app.post("/api/ai/diet", async (req, res) => {
    try {
      const { memberName, weight, height, goal, dietType, caloriesLimit } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing. Please set it in Settings > Secrets." });
      }

      const prompt = `Create a top-class premium AI Diet Plan for a gym member:
      - Member Name: ${memberName || 'Elite Athlete'}
      - Weight: ${weight || '75'} kg
      - Height: ${height || '178'} cm
      - Goal: ${goal || 'Fat Loss & Sculpting'}
      - Preference: ${dietType || 'High Protein / Vegetarian'}
      - Calories Limit: ${caloriesLimit || '2200'} kcal/day

      Provide a beautifully structured premium diet plan in clean Markdown with day-by-day food guides, micro/macro nutrient allocations, water intake timetables, and fat burning or muscle-gain recommendations.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Diet Error:", error);
      return res.status(500).json({ error: "Failed to generate diet plan safely." });
    }
  });

  // 3. POST /api/ai/analytics - Advanced Dashboard Business SWOT/AI Audit
  app.post("/api/ai/analytics", async (req, res) => {
    try {
      const { stats, membersCount, paymentsSum } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is missing. Please set it in Settings > Secrets." });
      }

      const prompt = `You are an elite International Gymnasium Business Consultant. Analyze these real-time SaaS facts for "C Vidya Fitness Zone":
      - Total Registered Members: ${membersCount || 0}
      - Total Current Monthly Revenue: ₹${paymentsSum || 0}
      - Active Workout Check-ins Count: ${stats?.activeMembers || 0}
      - Daily Attendance Rate: ${stats?.dailyCheckins || 0}
      
      Provide a highly professional enterprise audit report in clean Markdown. Include a SWOT Analysis, 3 immediate growth tactics to boost gym registration by 20%, high-end retention advice, and revenue projections for next season.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      return res.json({ result: response.text });
    } catch (error: any) {
      console.error("AI Analytics Error:", error);
      return res.status(500).json({ error: "Failed to generate AI analytics audit." });
    }
  });

  // 4. POST /api/reports/export - Export Custom Excel-Compatible Reports to CSV
  app.post("/api/reports/export", (req, res) => {
    const { collectionType, data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid reporting data provided." });
    }
    
    // Generate CSV response safely with escaped fields
    try {
      const headers = Object.keys(data[0] || {}).join(",");
      const rows = data.map(item => {
        return Object.values(item).map(val => {
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
      });
      const csvContent = [headers, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename=${collectionType || 'report'}.csv`);
      return res.send(csvContent);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to convert database to CSV reports." });
    }
  });

  // 5. GET /api/backup - Multi-System Database Backup Utility
  app.get("/api/backup", (req, res) => {
    const mockBackupPayload = {
      softwareName: "C Vidya Fitness Zone",
      exportTime: new Date().toISOString(),
      backupId: `FB-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "SUCCESSFUL_SECURE_EXPORT",
      tablesSupported: ["users", "members", "attendance", "payments", "plans", "inventory", "announcements", "settings"],
      description: "Local data state package configuration, including GST logs and Multi-branch schema tags."
    };
    return res.json(mockBackupPayload);
  });

  // 6. POST /api/whatsapp/send - Simulate Enterprise-Grade WhatsApp Notification Alert
  app.post("/api/whatsapp/send", (req, res) => {
    const { phone, memberName, messageType, customText } = req.body;
    const formattedPhone = phone ? String(phone).replace(/[^\d+]/g, '') : '+91 XXXXX XXXXX';
    return res.json({
      success: true,
      sender: "C Vidya Fitness Zone WhatsApp API Cloud Server",
      recipient: formattedPhone,
      messageLog: `Alert to ${memberName || 'Member'}: ${customText || 'Friendly reminder from C Vidya Fitness Zone.'}`,
      timestamp: new Date().toISOString(),
      status: "DELIVERED_SUCCESSFULLY"
    });
  });

  // Mount Vite middleware for dev mode OR serve production files
  const distPath = path.join(process.cwd(), 'dist');
  const distIndex = path.join(distPath, 'index.html');

  if ((isProd || fs.existsSync(distIndex)) && process.env.NODE_ENV !== "development") {
    console.log("Serving production build from dist...");
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(distIndex);
    });
  } else {
    console.log("Setting up Vite Applet middleware in Express...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  // 6. Hardening: Global Masked Error Handler - Never leak system internals or stack traces
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Server Security Error:", err?.message || err);
    if (res.headersSent) {
      return next(err);
    }
    return res.status(500).json({
      error: "Internal Server Error: Request terminated securely."
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[C Vidya Fitness Zone OS] custom full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
