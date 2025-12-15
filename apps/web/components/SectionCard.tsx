"use client";

type Section = {
  title: string;
  summary: string;
  bullets: string[];
};

export function SectionCard({
  section,
  onChange,
}: {
  section: Section;
  onChange: (section: Section) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Title - Bigger, bolder, calm */}
      <input
        className="w-full text-xl font-semibold outline-none bg-transparent text-gray-900 placeholder-gray-400"
        placeholder="Section title..."
        value={section.title}
        onChange={(e) =>
          onChange({ ...section, title: e.target.value })
        }
      />

      {/* Summary - Subtle background, looks like a note */}
      <textarea
        className="w-full bg-gray-50 rounded-lg p-3 resize-none outline-none text-gray-700 placeholder-gray-400 min-h-[60px]"
        placeholder="Summary..."
        value={section.summary}
        onChange={(e) =>
          onChange({ ...section, summary: e.target.value })
        }
      />

      {/* Bullets - Soft rows, feels like writing notes */}
      <ul className="space-y-2">
        {section.bullets.map((bullet, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 text-gray-400">•</span>
            <input
              className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-400"
              placeholder="Bullet point..."
              value={bullet}
              onChange={(e) => {
                const bullets = [...section.bullets];
                bullets[i] = e.target.value;
                onChange({ ...section, bullets });
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

