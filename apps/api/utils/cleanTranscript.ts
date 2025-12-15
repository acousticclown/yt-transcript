type TranscriptChunk = {
  text: string;
};

export function cleanTranscript(chunks: TranscriptChunk[]): string {
  return chunks
    .map((c) => c.text.trim())
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

