import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

const DEFAULT_USER_ID = "default-user";

// GET /tags - List all tags with note counts
router.get("/", async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        _count: { select: { noteTags: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json(
      tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        noteCount: tag._count.noteTags,
      }))
    );
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
});

// POST /tags - Create tag
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Tag name is required" });
    }

    // Check if tag already exists
    const existing = await prisma.tag.findUnique({
      where: { userId_name: { userId: DEFAULT_USER_ID, name } },
    });
    if (existing) {
      return res.status(409).json({ error: "Tag already exists" });
    }

    const tag = await prisma.tag.create({
      data: { name, color, userId: DEFAULT_USER_ID },
    });

    res.status(201).json({ id: tag.id, name: tag.name, color: tag.color });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ error: "Failed to create tag" });
  }
});

// PUT /tags/:id - Update tag
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    const tag = await prisma.tag.update({
      where: { id: req.params.id },
      data: { name, color },
    });

    res.json({ id: tag.id, name: tag.name, color: tag.color });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ error: "Failed to update tag" });
  }
});

// DELETE /tags/:id - Delete tag
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    await prisma.tag.delete({ where: { id: req.params.id } });
    res.json({ message: "Tag deleted" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ error: "Failed to delete tag" });
  }
});

export default router;

