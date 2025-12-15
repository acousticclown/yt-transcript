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
    <div className="border rounded p-4 space-y-3">
      <input
        className="w-full font-semibold text-lg outline-none"
        value={section.title}
        onChange={(e) =>
          onChange({ ...section, title: e.target.value })
        }
      />

      <textarea
        className="w-full resize-none outline-none"
        value={section.summary}
        onChange={(e) =>
          onChange({ ...section, summary: e.target.value })
        }
      />

      <ul className="list-disc pl-5 space-y-1">
        {section.bullets.map((bullet, i) => (
          <li key={i}>
            <input
              className="w-full outline-none"
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

