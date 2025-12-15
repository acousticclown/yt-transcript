import { writeFile, readFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Data directory is at apps/api/data
const DATA_DIR = join(__dirname, "..", "data");

export type SavedNote = {
  id: string;
  url: string;
  createdAt: string;
  sections: Array<{
    title: string;
    summary: string;
    bullets: string[];
  }>;
};

/**
 * Save a note to local JSON file
 */
export async function saveNote(note: SavedNote): Promise<void> {
  try {
    await mkdir(DATA_DIR, { recursive: true });

    const filePath = join(DATA_DIR, `${note.id}.json`);
    await writeFile(filePath, JSON.stringify(note, null, 2), "utf-8");
  } catch (error: any) {
    throw new Error(`Failed to save note to disk: ${error.message}`);
  }
}

/**
 * Load a saved note by ID
 */
export async function loadNote(id: string): Promise<SavedNote | null> {
  try {
    const filePath = join(DATA_DIR, `${id}.json`);
    const data = await readFile(filePath, "utf-8");
    return JSON.parse(data) as SavedNote;
  } catch (error) {
    return null;
  }
}

/**
 * List all saved notes
 */
export async function listNotes(): Promise<SavedNote[]> {
  try {
    const { readdir } = await import("fs/promises");
    const files = await readdir(DATA_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    const notes: SavedNote[] = [];
    for (const file of jsonFiles) {
      const note = await loadNote(file.replace(".json", ""));
      if (note) {
        notes.push(note);
      }
    }

    return notes.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    return [];
  }
}

