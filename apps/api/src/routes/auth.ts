import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "notely-secret-key-change-in-production";

// POST /auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    console.log("✅ User logged in:", user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /auth/signup
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "Email, password, and name required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });

    console.log("✅ User signed up:", user.email);
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("❌ Signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// GET /auth/me - Get current user from token
router.get("/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, avatar: true, geminiApiKey: true },
    });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ 
      user: {
        ...user,
        hasGeminiKey: !!user.geminiApiKey,
        geminiApiKey: undefined, // Don't expose the actual key
      }
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// PUT /auth/gemini-key - Save user's Gemini API key
router.put("/gemini-key", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const { apiKey } = req.body;

    // Validate the API key by making a test request
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const testAi = new GoogleGenAI({ apiKey });
        await testAi.models.generateContent({
          model: "gemini-1.5-flash",
          contents: "Say 'ok' in one word.",
        });
      } catch (err: any) {
        return res.status(400).json({ error: "Invalid API key. Please check and try again." });
      }
    }

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { geminiApiKey: apiKey || null },
    });

    console.log("✅ Gemini API key updated for user:", decoded.userId);
    res.json({ success: true, hasGeminiKey: !!apiKey });
  } catch (error) {
    console.error("❌ Gemini key update error:", error);
    res.status(500).json({ error: "Failed to update API key" });
  }
});

// DELETE /auth/gemini-key - Remove user's Gemini API key
router.delete("/gemini-key", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { geminiApiKey: null },
    });

    console.log("✅ Gemini API key removed for user:", decoded.userId);
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Gemini key delete error:", error);
    res.status(500).json({ error: "Failed to remove API key" });
  }
});

export default router;

