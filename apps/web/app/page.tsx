"use client";

import { useState } from "react";
import { SectionCard } from "../components/SectionCard";

type Section = {
  title: string;
  summary: string;
  bullets: string[];
};

const loadingMessages = [
  "🧠 Listening to the video…",
  "✍️ Writing clean notes…",
  "🧩 Organizing thoughts…",
  "🎨 Making it readable…",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  async function generateNotes() {
    setLoading(true);
    setSections([]);
    // Random loading message for micro-playfulness
    setLoadingMessage(
      loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
    );

    try {
      // 1. Fetch transcript
      const transcriptRes = await fetch("http://localhost:3001/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const transcriptData = await transcriptRes.json();

      if (transcriptData.error) {
        alert(`⚠️ ${transcriptData.error}`);
        setLoading(false);
        return;
      }

      // 2. Fetch sections
      const sectionsRes = await fetch("http://localhost:3001/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcriptData.transcript }),
      });
      const sectionsData = await sectionsRes.json();

      if (sectionsData.error) {
        alert(`⚠️ ${sectionsData.error}`);
        setLoading(false);
        return;
      }

      setSections(sectionsData.sections || []);
    } catch {
      alert(
        "⚠️ Failed to generate notes. Make sure the API server is running on port 3001."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900">YT-Transcript</h1>

      <div className="flex gap-3">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
          placeholder="Paste YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              generateNotes();
            }
          }}
        />
        <button
          onClick={generateNotes}
          disabled={loading || !url.trim()}
          className="bg-black text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          Generate Notes
        </button>
      </div>

      {sections.length > 0 && (
        <div className="flex gap-3">
          <button
            onClick={async () => {
              if (sections.length === 0) {
                alert("No sections to save.");
                return;
              }
              setSaving(true);
              try {
                const res = await fetch("http://localhost:3001/save", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ url, sections }),
                });

                if (!res.ok) {
                  const errorData = await res
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                  alert(errorData.error || `Failed to save: ${res.status}`);
                  return;
                }

                const data = await res.json();
                if (data.error) {
                  alert(data.error);
                } else {
                  alert("Notes saved!");
                }
              } catch {
                alert(
                  "⚠️ Failed to save notes. Make sure the API server is running."
                );
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || sections.length === 0}
            className="border border-gray-300 px-5 py-2.5 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            {saving ? "Saving..." : "Save to Library"}
          </button>
          <button
            onClick={async () => {
              if (sections.length === 0) {
                alert("No sections to export.");
                return;
              }
              try {
                const res = await fetch(
                  "http://localhost:3001/export/markdown",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ sections }),
                  }
                );

                if (!res.ok) {
                  const errorData = await res
                    .json()
                    .catch(() => ({ error: "Unknown error" }));
                  alert(errorData.error || `Failed to export: ${res.status}`);
                  return;
                }

                const blob = await res.blob();
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = "notes.md";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(downloadUrl);
              } catch {
                alert(
                  "⚠️ Failed to export notes. Make sure the API server is running."
                );
              }
            }}
            disabled={sections.length === 0}
            className="border border-gray-300 px-5 py-2.5 rounded-lg font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Export as Markdown
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">{loadingMessage}</p>
        </div>
      )}

      {!loading && sections.length === 0 && (
        <div className="text-center py-16 px-4">
          <p className="text-gray-500 text-lg mb-2">
            👋 Paste a YouTube link to begin.
          </p>
          <p className="text-gray-400 text-sm">
            Your notes will appear here, fully editable.
          </p>
        </div>
      )}

      <section className="space-y-5">
        {sections.map((section, idx) => (
          <SectionCard
            key={idx}
            section={section}
            onChange={(updated) => {
              const copy = [...sections];
              copy[idx] = updated;
              setSections(copy);
            }}
          />
        ))}
      </section>
    </main>
  );
}
