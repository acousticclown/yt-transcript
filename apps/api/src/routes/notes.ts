import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

// Default user for now (will be replaced with auth later)
const DEFAULT_USER_ID = "default-user";

// Ensure default user exists
async function ensureDefaultUser() {
  const user = await prisma.user.findUnique({
    where: { id: DEFAULT_USER_ID },
  });
  if (!user) {
    await prisma.user.create({
      data: { id: DEFAULT_USER_ID, name: "Default User" },
    });
  }
}

// GET /notes - List all notes
router.get("/", async (req: Request, res: Response) => {
  try {
    await ensureDefaultUser();
    const notes = await prisma.note.findMany({
      where: { userId: DEFAULT_USER_ID },
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
      })),
    }));

    res.json(transformed);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// GET /notes/:id - Get single note
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: req.params.id },
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
      })),
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ error: "Failed to fetch note" });
  }
});

// POST /notes - Create note
router.post("/", async (req: Request, res: Response) => {
  try {
    await ensureDefaultUser();
    const { title, content, language, source, youtubeUrl, color, tags, sections } = req.body;

    // Create note
    const note = await prisma.note.create({
      data: {
        title: title || "Untitled",
        content: content || "",
        language: language || "english",
        source: source || "manual",
        youtubeUrl,
        color,
        userId: DEFAULT_USER_ID,
        sections: sections
          ? {
              create: sections.map((s: any, i: number) => ({
                title: s.title,
                summary: s.summary,
                bullets: JSON.stringify(s.bullets || []),
                language: s.language || "english",
                order: i,
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
          where: { userId_name: { userId: DEFAULT_USER_ID, name: tagName } },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, userId: DEFAULT_USER_ID },
          });
        }
        // Link to note
        await prisma.noteTag.create({
          data: { noteId: note.id, tagId: tag.id },
        });
      }
    }

    res.status(201).json({ id: note.id, message: "Note created" });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ error: "Failed to create note" });
  }
});

// PUT /notes/:id - Update note
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { title, content, language, isFavorite, color, tags, sections } = req.body;

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
          where: { userId_name: { userId: DEFAULT_USER_ID, name: tagName } },
        });
        if (!tag) {
          tag = await prisma.tag.create({
            data: { name: tagName, userId: DEFAULT_USER_ID },
          });
        }
        await prisma.noteTag.create({
          data: { noteId: note.id, tagId: tag.id },
        });
      }
    }

    res.json({ id: note.id, message: "Note updated" });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ error: "Failed to update note" });
  }
});

// DELETE /notes/:id - Delete note
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.note.delete({ where: { id: req.params.id } });
    res.json({ message: "Note deleted" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ error: "Failed to delete note" });
  }
});

// POST /notes/:id/favorite - Toggle favorite
router.post("/:id/favorite", async (req: Request, res: Response) => {
  try {
    const note = await prisma.note.findUnique({ where: { id: req.params.id } });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    await prisma.note.update({
      where: { id: req.params.id },
      data: { isFavorite: !note.isFavorite },
    });

    res.json({ isFavorite: !note.isFavorite });
  } catch (error) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ error: "Failed to toggle favorite" });
  }
});

export default router;

