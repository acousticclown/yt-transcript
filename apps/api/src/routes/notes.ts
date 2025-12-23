import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /notes - List all notes for authenticated user
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const notes = await prisma.note.findMany({
      where: { userId },
      include: {
        sections: { orderBy: { order: "asc" } },
        noteTags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Transform to frontend format
    const transformed = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      language: note.language,
      source: note.source,
      youtubeUrl: note.youtubeUrl,
      isFavorite: note.isFavorite,
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
      isPublic: note.isPublic,
      shareToken: note.shareToken,
      shareExpiresAt: note.shareExpiresAt?.toISOString(),
    }));

    res.json(transformed);
  } catch (error) {
    logger.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// GET /notes/:id - Get single note
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId },
      include: {
        sections: { orderBy: { order: "asc" } },
        noteTags: { include: { tag: true } },
      },
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({
      id: note.id,
      title: note.title,
      content: note.content,
      language: note.language,
      source: note.source,
      youtubeUrl: note.youtubeUrl,
      isFavorite: note.isFavorite,
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
      isPublic: note.isPublic,
      shareToken: note.shareToken,
      shareExpiresAt: note.shareExpiresAt?.toISOString(),
    });
  } catch (error) {
    logger.error("Error fetching note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// POST /notes - Create note
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, content, language, source, youtubeUrl, videoId, color, tags, sections, isAIGenerated } = req.body;
    
    logger.debug("📝 Creating note:", { title, source, isAIGenerated, userId });

    // Create note
    const note = await prisma.note.create({
      data: {
        title: title || "Untitled",
        content: content || "",
        language: language || "english",
        source: source || "manual",
        isAIGenerated: isAIGenerated || (source === "ai") || (source === "youtube" && sections?.length > 0),
        youtubeUrl,
        videoId,
        color,
        userId,
        sections: sections
          ? {
              create: sections.map((s: any, i: number) => ({
                title: s.title,
                summary: s.summary,
                bullets: JSON.stringify(s.bullets || []),
                language: s.language || "english",
                order: i,
                startTime: s.startTime ?? null,
                endTime: s.endTime ?? null,
              })),
            }
          : undefined,
      },
      include: {
        sections: true,
        noteTags: { include: { tag: true } },
      },
    });

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Find or create tag
        let tag = await prisma.tag.findUnique({
          where: { userId_name: { userId, name: tagName } },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, userId },
          });
        }
        // Link to note
        await prisma.noteTag.create({
          data: { noteId: note.id, tagId: tag.id },
        });
      }
    }

    logger.log("✅ Note created:", note.id);
    res.status(201).json({ id: note.id, message: "Note created" });
  } catch (error) {
    logger.error("❌ Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// PUT /notes/:id - Update note
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { title, content, language, isFavorite, color, tags, sections } = req.body;
    
    // Verify ownership
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    console.log("📝 Updating note:", req.params.id, { title });

    // Update note
    const note = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        language,
        isFavorite,
        color,
      },
    });

    // Update sections if provided
    if (sections) {
      // Delete existing sections
      await prisma.section.deleteMany({ where: { noteId: note.id } });
      // Create new sections
      await prisma.section.createMany({
        data: sections.map((s: any, i: number) => ({
          id: s.id,
          title: s.title,
          summary: s.summary,
          bullets: JSON.stringify(s.bullets || []),
          language: s.language || "english",
          order: i,
          noteId: note.id,
          startTime: s.startTime ?? null,
          endTime: s.endTime ?? null,
        })),
      });
    }

    // Update tags if provided
    if (tags) {
      // Remove existing tags
      await prisma.noteTag.deleteMany({ where: { noteId: note.id } });
      // Add new tags
      for (const tagName of tags) {
        let tag = await prisma.tag.findUnique({
          where: { userId_name: { userId, name: tagName } },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, userId },
          });
        }
        await prisma.noteTag.create({
          data: { noteId: note.id, tagId: tag.id },
        });
      }
    }

    console.log("✅ Note updated:", note.id);
    res.json({ id: note.id, message: "Note updated" });
  } catch (error) {
    console.error("❌ Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// DELETE /notes/:id - Delete note
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Verify ownership
    const existing = await prisma.note.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!existing) {
      return res.status(404).json({ error: "Note not found" });
    }
    
    console.log("🗑️ Deleting note:", req.params.id);
    await prisma.note.delete({ where: { id: req.params.id } });
    console.log("✅ Note deleted:", req.params.id);
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// POST /notes/:id/favorite - Toggle favorite
router.post("/:id/favorite", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    
    const note = await prisma.note.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await prisma.note.update({
      where: { id: req.params.id },
      data: { isFavorite: !note.isFavorite },
    });

    console.log("⭐ Toggled favorite:", req.params.id, "→", !note.isFavorite);
    res.json({ isFavorite: !note.isFavorite });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

// POST /notes/:id/share - Enable sharing
router.post("/:id/share", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { password, expiresInDays } = req.body;

    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
    });

    if (!note || note.userId !== userId) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(16).toString("hex");

    // Hash password if provided
    let sharePassword = null;
    if (password) {
      sharePassword = await bcrypt.hash(password, 10);
    }

    // Calculate expiration if provided
    let shareExpiresAt = null;
    if (expiresInDays && expiresInDays > 0) {
      shareExpiresAt = new Date();
      shareExpiresAt.setDate(shareExpiresAt.getDate() + expiresInDays);
    }

    const updated = await prisma.note.update({
      where: { id: req.params.id },
      data: {
        isPublic: true,
        shareToken,
        sharePassword,
        shareExpiresAt,
      },
    });

    console.log("🔗 Note shared:", req.params.id, "token:", shareToken);
    res.json({
      shareToken,
      shareUrl: `${process.env.FRONTEND_URL || "http://localhost:3000"}/share/${shareToken}`,
      isPasswordProtected: !!sharePassword,
      expiresAt: shareExpiresAt?.toISOString() || null,
    });
  } catch (error) {
    console.error("Error sharing note:", error);
    res.status(500).json({ error: "Failed to share note" });
  }
});

// DELETE /notes/:id/share - Disable sharing
router.delete("/:id/share", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;

    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
    });

    if (!note || note.userId !== userId) {
      return res.status(404).json({ error: "Note not found" });
    }

    await prisma.note.update({
      where: { id: req.params.id },
      data: {
        isPublic: false,
        shareToken: null,
        sharePassword: null,
        shareExpiresAt: null,
      },
    });

    console.log("🔒 Note sharing disabled:", req.params.id);
    res.json({ message: "Sharing disabled" });
  } catch (error) {
    console.error("Error disabling sharing:", error);
    res.status(500).json({ error: "Failed to disable sharing" });
  }
});

export default router;
