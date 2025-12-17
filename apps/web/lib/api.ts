const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Auth helpers
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("notely-token");
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Auth types
export type User = {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  hasGeminiKey?: boolean;
};

// Auth API
export const authApi = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Login failed");
    }
    return res.json();
  },

  async signup(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Signup failed");
    }
    return res.json();
  },

  async me(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Not authenticated");
    return res.json();
  },
};

// Types
export type NoteSection = {
  id: string;
  title: string;
  summary: string;
  bullets: string[];
  language: "english" | "hindi" | "hinglish";
  startTime?: number;
  endTime?: number;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  language: "english" | "hindi" | "hinglish";
  source: "manual" | "youtube" | "ai";
  isAIGenerated?: boolean;
  youtubeUrl?: string;
  videoId?: string;
  isFavorite: boolean;
  color?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  sections: NoteSection[];
  // Sharing fields
  isPublic?: boolean;
  shareToken?: string;
  shareExpiresAt?: string;
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
    const res = await fetch(`${API_BASE}/api/notes`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch notes");
    return res.json();
  },

  async get(id: string): Promise<Note> {
    const res = await fetch(`${API_BASE}/api/notes/${id}`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch note");
    return res.json();
  },

  async create(data: Partial<Note>): Promise<{ id: string }> {
    const res = await fetch(`${API_BASE}/api/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create note");
    return res.json();
  },

  async update(id: string, data: Partial<Note>): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update note");
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notes/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete note");
  },

  async toggleFavorite(id: string): Promise<{ isFavorite: boolean }> {
    const res = await fetch(`${API_BASE}/api/notes/${id}/favorite`, {
      method: "POST",
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to toggle favorite");
    return res.json();
  },

  async share(
    id: string,
    options?: { password?: string; expiresInDays?: number }
  ): Promise<{
    shareToken: string;
    shareUrl: string;
    isPasswordProtected: boolean;
    expiresAt: string | null;
  }> {
    const res = await fetch(`${API_BASE}/api/notes/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(options || {}),
    });
    if (!res.ok) throw new Error("Failed to share note");
    return res.json();
  },

  async unshare(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notes/${id}/share`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to unshare note");
  },
};

// Public API (no auth required)
export const publicApi = {
  async getSharedNote(token: string): Promise<Note & { isPasswordProtected: boolean; author: { name: string; avatar?: string } }> {
    const res = await fetch(`${API_BASE}/api/public/notes/${token}`);
    if (!res.ok) throw new Error("Failed to fetch shared note");
    return res.json();
  },

  async verifyPassword(token: string, password: string): Promise<{ verified: boolean }> {
    const res = await fetch(`${API_BASE}/api/public/notes/${token}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) throw new Error("Invalid password");
    return res.json();
  },
};

// Tags API
export const tagsApi = {
  async list(): Promise<Tag[]> {
    const res = await fetch(`${API_BASE}/api/tags`, {
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to fetch tags");
    return res.json();
  },

  async create(name: string, color?: string): Promise<Tag> {
    const res = await fetch(`${API_BASE}/api/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ name, color }),
    });
    if (!res.ok) throw new Error("Failed to create tag");
    return res.json();
  },

  async update(
    id: string,
    data: { name?: string; color?: string }
  ): Promise<Tag> {
    const res = await fetch(`${API_BASE}/api/tags/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update tag");
    return res.json();
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/tags/${id}`, {
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    if (!res.ok) throw new Error("Failed to delete tag");
  },
};

// YouTube API (legacy endpoints)
export const youtubeApi = {
  async getTranscript(
    url: string
  ): Promise<{ transcript: string; videoId: string }> {
    const res = await fetch(`${API_BASE}/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) throw new Error("Failed to extract transcript");
    return res.json();
  },

  async generateSections(
    transcript: string,
    subtitles?: { text: string; start: number; dur: number }[]
  ): Promise<{ sections: NoteSection[] }> {
    const res = await fetch(`${API_BASE}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript, subtitles }),
    });
    if (!res.ok) throw new Error("Failed to generate sections");
    return res.json();
  },

  // Combined: fetch transcript + generate sections with timestamps
  async generate(url: string): Promise<{
    sections: NoteSection[];
    summary?: string;
    tags?: string[];
    videoId?: string;
    error?: string;
  }> {
    // 1. Get transcript with subtitles (no AI, no auth needed)
    const transcriptRes = await fetch(`${API_BASE}/transcript`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const transcriptData = await transcriptRes.json();

    if (transcriptData.error) {
      return { sections: [], error: transcriptData.error };
    }

    // 2. Generate sections with timestamps and summary (AI - needs auth)
    const sectionsRes = await fetch(`${API_BASE}/sections`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({
        transcript: transcriptData.transcript,
        subtitles: transcriptData.subtitles,
      }),
    });
    const sectionsData = await sectionsRes.json();

    if (sectionsData.error) {
      // Special handling for API key required
      if (sectionsData.error === "API_KEY_REQUIRED") {
        return { sections: [], error: "API_KEY_REQUIRED" };
      }
      return { sections: [], error: sectionsData.error };
    }

    return {
      sections: sectionsData.sections || [],
      summary: sectionsData.summary || "",
      tags: sectionsData.tags || ["youtube"],
      videoId: transcriptData.videoId,
    };
  },
};

// AI API
export const aiApi = {
  async inline(
    text: string,
    action: "simplify" | "expand" | "example"
  ): Promise<string> {
    const res = await fetch(`${API_BASE}/api/ai/inline`, {
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
    const res = await fetch(`${API_BASE}/api/ai/transform-language`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, targetLanguage, tone }),
    });
    if (!res.ok) throw new Error("Failed to transform language");
    const data = await res.json();
    return data.result;
  },

  async generateNote(prompt: string): Promise<{
    title: string;
    content: string;
    tags: string[];
    sections: Array<{
      id: string;
      title: string;
      summary: string;
      bullets: string[];
      language: "english" | "hindi" | "hinglish";
    }>;
  }> {
    const res = await fetch(`${API_BASE}/api/ai/generate-note`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) throw new Error("Failed to generate note");
    const data = await res.json();
    return data.note;
  },
};
