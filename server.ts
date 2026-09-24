import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers Middleware
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(self), microphone=(), geolocation=()");
    // Strict Transport Security (HSTS)
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    next();
  });

  // Body parser with size limits to prevent Denial of Service
  app.use(express.json({ limit: "1mb" }));

  // In-memory Rate Limiting for API routes
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
  const MAX_REQUESTS_PER_WINDOW = 100; // 100 req/min per IP

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
        error: "Too many requests. Rate limit exceeded. Please try again in 1 minute."
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
      return res.status(500).json({ error: error.message || "Failed to generate workout plan." });
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
      return res.status(500).json({ error: error.message || "Failed to generate diet plan." });
    }
  });

  // 3. POST /api/ai/analytics - Advanced Dashboard Business SWOT/AI Audit
  app.post("/api/ai/analytics", async (req, res) => {
    try {
      const { stats, membersCount, paymentsSum } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "Gemini API key is is missing. Please set it in Settings > Secrets." });
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
      return res.status(500).json({ error: error.message || "Failed to generate AI analytics audit." });
    }
  });

  // 4. POST /api/reports/export - Export Custom Excel-Compatible Reports to CSV
  app.post("/api/reports/export", (req, res) => {
    const { collectionType, data } = req.body;
    if (!data || !Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid reporting data provided." });
    }
    
    // Generate CSV response
    try {
      const headers = Object.keys(data[0] || {}).join(",");
      const rows = data.map(item => {
        return Object.values(item).map(val => {
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        }).join(",");
      });
      const csvContent = [headers, ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
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

  //6. POST /api/whatsapp/send - Simulate Enterprise-Grade WhatsApp Notification Alert
  app.post("/api/whatsapp/send", (req, res) => {
    const { phone, memberName, messageType, customText } = req.body;
    const formattedPhone = phone || '+91 XXXXX XXXXX';
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
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite Applet middleware in Express...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[C Vidya Fitness Zone OS] custom full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
