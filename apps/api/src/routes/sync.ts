import { Router } from "express";
import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

/**
 * GET /api/sync/status
 * Get sync status for the user
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const lastSyncAt = req.query.lastSyncAt as string | undefined;

    // Get counts
    const totalNotes = await prisma.note.count({
      where: { userId },
    });

    const notesSinceSync = lastSyncAt
      ? await prisma.note.count({
          where: {
            userId,
            updatedAt: {
              gt: new Date(lastSyncAt),
            },
          },
        })
      : totalNotes;

    res.json({
      totalNotes,
      notesSinceSync,
      lastSyncAt: lastSyncAt || null,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting sync status:", error);
    res.status(500).json({ error: "Failed to get sync status" });
  }
});

/**
 * POST /api/sync/pull
 * Pull changes from server (get updated notes)
 */
router.post("/pull", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { lastSyncAt, deviceId } = req.body;

    // Get notes updated since last sync
    const whereClause: any = { userId };
    if (lastSyncAt) {
      whereClause.updatedAt = {
        gt: new Date(lastSyncAt),
      };
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        sections: { orderBy: { order: "asc" } },
        noteTags: { include: { tag: true } },
      },
      orderBy: { updatedAt: "asc" },
    });

    // Transform to frontend format
    const transformed = notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      language: note.language,
      source: note.source,
      isAIGenerated: note.isAIGenerated,
      youtubeUrl: note.youtubeUrl,
      videoId: note.videoId,
      isFavorite: note.isFavorite,
      color: note.color,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
      version: note.version,
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

    res.json({
      notes: transformed,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error pulling sync:", error);
    res.status(500).json({ error: "Failed to pull sync" });
  }
});

/**
 * POST /api/sync/push
 * Push changes to server (send local changes)
 */
router.post("/push", async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { notes, deviceId } = req.body;

    if (!Array.isArray(notes)) {
      return res.status(400).json({ error: "Notes must be an array" });
    }

    const results = {
      created: [] as string[],
      updated: [] as string[],
      conflicts: [] as Array<{ noteId: string; reason: string }>,
    };

    for (const noteData of notes) {
      try {
        const existingNote = await prisma.note.findFirst({
          where: { id: noteData.id, userId },
        });

        if (existingNote) {
          // Conflict resolution: Last-write-wins with version check
          if (noteData.version && existingNote.version > noteData.version) {
            // Server version is newer, skip update
            results.conflicts.push({
              noteId: noteData.id,
              reason: "Server version is newer",
            });
            continue;
          }

          // Update existing note
          await prisma.note.update({
            where: { id: noteData.id },
            data: {
              title: noteData.title,
              content: noteData.content,
              language: noteData.language,
              source: noteData.source,
              isAIGenerated: noteData.isAIGenerated || false,
              youtubeUrl: noteData.youtubeUrl,
              videoId: noteData.videoId,
              isFavorite: noteData.isFavorite || false,
              color: noteData.color,
              version: { increment: 1 },
              lastSyncedAt: new Date(),
              deviceId: deviceId || null,
              // Update sections if provided
              sections: noteData.sections
                ? {
                    deleteMany: {},
                    create: noteData.sections.map(
                      (s: any, index: number) => ({
                        title: s.title,
                        summary: s.summary,
                        bullets: JSON.stringify(s.bullets || []),
                        language: s.language || "english",
                        order: index,
                        startTime: s.startTime,
                        endTime: s.endTime,
                      })
                    ),
                  }
                : undefined,
            },
          });

          // Update tags
          if (noteData.tags) {
            await prisma.noteTag.deleteMany({
              where: { noteId: noteData.id },
            });

            for (const tagName of noteData.tags) {
              let tag = await prisma.tag.findFirst({
                where: { name: tagName, userId },
              });

              if (!tag) {
                tag = await prisma.tag.create({
                  data: {
                    name: tagName,
                    userId,
                  },
                });
              }

              await prisma.noteTag.create({
                data: {
                  noteId: noteData.id,
                  tagId: tag.id,
                },
              });
            }
          }

          results.updated.push(noteData.id);
        } else {
          // Create new note
          await prisma.note.create({
            data: {
              id: noteData.id,
              title: noteData.title,
              content: noteData.content,
              language: noteData.language,
              source: noteData.source,
              isAIGenerated: noteData.isAIGenerated || false,
              youtubeUrl: noteData.youtubeUrl,
              videoId: noteData.videoId,
              isFavorite: noteData.isFavorite || false,
              color: noteData.color,
              userId,
              version: 1,
              lastSyncedAt: new Date(),
              deviceId: deviceId || null,
              sections: noteData.sections
                ? {
                    create: noteData.sections.map((s: any, index: number) => ({
                      title: s.title,
                      summary: s.summary,
                      bullets: JSON.stringify(s.bullets || []),
                      language: s.language || "english",
                      order: index,
                      startTime: s.startTime,
                      endTime: s.endTime,
                    })),
                  }
                : undefined,
            },
          });

          // Create tags
          if (noteData.tags) {
            for (const tagName of noteData.tags) {
              let tag = await prisma.tag.findFirst({
                where: { name: tagName, userId },
              });

              if (!tag) {
                tag = await prisma.tag.create({
                  data: {
                    name: tagName,
                    userId,
                  },
                });
              }

              await prisma.noteTag.create({
                data: {
                  noteId: noteData.id,
                  tagId: tag.id,
                },
              });
            }
          }

          results.created.push(noteData.id);
        }
      } catch (error) {
        logger.error(`Error syncing note ${noteData.id}:`, error);
        results.conflicts.push({
          noteId: noteData.id,
          reason: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    res.json({
      ...results,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error pushing sync:", error);
    res.status(500).json({ error: "Failed to push sync" });
  }
});

export default router;

