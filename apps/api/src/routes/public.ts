import { Router } from "express";
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";

const router = Router();

// GET /public/notes/:token - Get public note (no auth required)
router.get("/notes/:token", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const note = await prisma.note.findUnique({
      where: { shareToken: token },
      include: {
        sections: { orderBy: { order: "asc" } },
        noteTags: { include: { tag: true } },
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!note || !note.isPublic) {
      return res.status(404).json({ error: "Note not found or not shared" });
    }

    // Check expiration
    if (note.shareExpiresAt && new Date(note.shareExpiresAt) < new Date()) {
      return res.status(410).json({ error: "This shared note has expired" });
    }

    // Return note info (password protection check happens in verify endpoint)
    res.json({
      id: note.id,
      title: note.title,
      content: note.content,
      language: note.language,
      source: note.source,
      youtubeUrl: note.youtubeUrl,
      color: note.color,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      tags: note.noteTags.map((nt) => nt.tag.name),
      sections: note.sections.map((s) => ({
        id: s.id,
        title: s.title,
        summary: s.summary,
        bullets: JSON.parse(s.bullets),
        language: s.language,
        startTime: s.startTime,
        endTime: s.endTime,
      })),
      isPasswordProtected: !!note.sharePassword,
      author: {
        name: note.user.name,
        avatar: note.user.avatar,
      },
    });
  } catch (error) {
    logger.error("Error fetching public note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// POST /public/notes/:token/verify - Verify password for protected note
router.post("/notes/:token/verify", async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const note = await prisma.note.findUnique({
      where: { shareToken: token },
    });

    if (!note || !note.isPublic) {
      return res.status(404).json({ error: "Note not found" });
    }

    if (!note.sharePassword) {
      return res.status(400).json({ error: "Note is not password protected" });
    }

    const isValid = await bcrypt.compare(password, note.sharePassword);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({ verified: true });
  } catch (error) {
    logger.error("Error verifying password:", error);
    res.status(500).json({ error: "Failed to verify password" });
  }
});

export default router;

