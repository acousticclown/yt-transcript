const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Types
export type NoteSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  language: "english" | "hindi" | "hinglish";
};

export type Note = {
  id: string;
  title: string;
  content: string;
  language: "english" | "hindi" | "hinglish";
  source: "manual" | "youtube";
  youtubeUrl?: string;
  isFavorite: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  sections: NoteSection[];
};

export type Tag = {
  id: string;
  name: string;
  color?: string;
  noteCount: number;
};

// Notes API
export const notesApi = {
  async list(): Promise<Note[]> {
    const res = await fetch(`${API_BASE}/api/notes`);
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
  },

  async get(id: string): Promise<Note> {
    const res = await fetch(`${API_BASE}/api/notes/${id}`);
    if (!res.ok) throw new Error("Failed to fetch note");
    return res.json();
  },

  async create(data: Partial<Note>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create note");
    return res.json();
  },

  async update(id: string, data: Partial<Note>): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update note");
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notes/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete note");
  },

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const res = await fetch(`${API_BASE}/api/notes/${id}/favorite`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to toggle favorite");
    return res.json();
  },
};

// Tags API
export const tagsApi = {
  async list(): Promise<Tag[]> {
    const res = await fetch(`${API_BASE}/api/tags`);
    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
  },

  async create(name: string, color?: string): Promise<Tag> {
    const res = await fetch(`${API_BASE}/api/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  },

  async update(id: string, data: { name?: string; color?: string }): Promise<Tag> {
    const res = await fetch(`${API_BASE}/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update tag");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/tags/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete tag");
  },
};

// YouTube API (legacy endpoints)
export const youtubeApi = {
  async getTranscript(url: string): Promise<{ transcript: string; videoId: string }> {
    const res = await fetch(`${API_BASE}/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("Failed to extract transcript");
    return res.json();
  },

  async generateSections(transcript: string): Promise<{ sections: NoteSection[] }> {
    const res = await fetch(`${API_BASE}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    });
    if (!res.ok) throw new Error("Failed to generate sections");
    return res.json();
  },
};

// AI API
export const aiApi = {
  async inline(text: string, action: "simplify" | "expand" | "example"): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/inline`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, action }),
    });
    if (!res.ok) throw new Error("Failed to process AI action");
    const data = await res.json();
    return data.result;
  },

  async transformLanguage(
    text: string,
    targetLanguage: "english" | "hindi" | "hinglish",
    tone?: string
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/ai/transform-language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLanguage, tone }),
    });
    if (!res.ok) throw new Error("Failed to transform language");
    const data = await res.json();
    return data.result;
  },
};

