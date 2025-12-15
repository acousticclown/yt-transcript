"use client";

import { useState } from "react";
import { SectionCard } from "../components/SectionCard";

type Section = {
  title: string;
  summary: string;
  bullets: string[];
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(false);

  async function generateNotes() {
    setLoading(true);
    setSections([]);

    try {
      // 1. Fetch transcript
      const transcriptRes = await fetch("http://localhost:3001/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const transcriptData = await transcriptRes.json();

      if (transcriptData.error) {
        alert(transcriptData.error);
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
        alert(sectionsData.error);
        setLoading(false);
        return;
      }

      setSections(sectionsData.sections || []);
    } catch (error) {
      console.error("Error generating notes:", error);
      alert("Failed to generate notes. Make sure the API server is running.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">YT-Transcript</h1>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
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
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate
        </button>
      </div>

      {loading && <p>🧠 Generating notes…</p>}

      <section className="space-y-4">
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
