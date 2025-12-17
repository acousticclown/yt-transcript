/**
 * AI Streaming Hook
 * Handles SSE streaming for AI generation with thinking states
 */

import { useState, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("notely-token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type ThinkingStep = {
  id: string;
  message: string;
  status: "pending" | "active" | "completed";
};

export type StreamState = 
  | "idle"
  | "connecting"
  | "thinking"
  | "streaming"
  | "complete"
  | "error";

export type GeneratedNote = {
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
};

type StreamEvent = 
  | { type: "thinking"; step: string; message: string }
  | { type: "chunk"; content: string }
  | { type: "complete"; data: GeneratedNote }
  | { type: "error"; message: string };

const DEFAULT_STEPS: ThinkingStep[] = [
  { id: "analyzing", message: "Understanding your request...", status: "pending" },
  { id: "structuring", message: "Planning note structure...", status: "pending" },
  { id: "generating", message: "Writing content...", status: "pending" },
  { id: "finalizing", message: "Polishing your note...", status: "pending" },
];

export function useAIStream() {
  const [state, setState] = useState<StreamState>("idle");
  const [steps, setSteps] = useState<ThinkingStep[]>(DEFAULT_STEPS);
  const [streamedContent, setStreamedContent] = useState("");
  const [result, setResult] = useState<GeneratedNote | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const updateStep = useCallback((stepId: string) => {
    setSteps(prev => prev.map(step => ({
      ...step,
      status: step.id === stepId 
        ? "active" 
        : prev.findIndex(s => s.id === stepId) > prev.findIndex(s => s.id === step.id)
          ? "completed"
          : step.status
    })));
  }, []);

  const generate = useCallback(async (prompt: string): Promise<GeneratedNote | null> => {
    // Reset state
    setState("connecting");
    setSteps(DEFAULT_STEPS);
    setStreamedContent("");
    setResult(null);
    setError(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch(`${API_BASE}/api/ai/generate-note/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ prompt }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.error === "API_KEY_REQUIRED") {
          throw new Error("API_KEY_REQUIRED");
        }
        throw new Error(data.error || "Failed to connect to AI");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response stream");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      setState("thinking");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: StreamEvent = JSON.parse(line.slice(6));
              
              switch (event.type) {
                case "thinking":
                  setState("thinking");
                  updateStep(event.step);
                  break;
                  
                case "chunk":
                  setState("streaming");
                  setStreamedContent(prev => prev + event.content);
                  break;
                  
                case "complete":
                  setState("complete");
                  setSteps(prev => prev.map(s => ({ ...s, status: "completed" })));
                  setResult(event.data);
                  return event.data;
                  
                case "error":
                  throw new Error(event.message);
              }
            } catch (parseError) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      return result;

    } catch (err: any) {
      if (err.name === "AbortError") {
        setState("idle");
        return null;
      }
      
      // Only log non-expected errors
      if (err.message !== "API_KEY_REQUIRED") {
        console.error("AI Stream error:", err);
      }
      setState("error");
      setError(err.message || "Generation failed");
      return null;
    }
  }, [updateStep, result]);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setState("idle");
    setSteps(DEFAULT_STEPS);
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setSteps(DEFAULT_STEPS);
    setStreamedContent("");
    setResult(null);
    setError(null);
  }, []);

  return {
    state,
    steps,
    streamedContent,
    result,
    error,
    generate,
    cancel,
    reset,
    isLoading: state !== "idle" && state !== "complete" && state !== "error",
  };
}

/**
 * Non-streaming fallback for simple generation
 */
export async function generateNoteSimple(prompt: string): Promise<GeneratedNote> {
  const res = await fetch(`${API_BASE}/api/ai/generate-note`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  
  if (!res.ok) {
    throw new Error("Failed to generate note");
  }
  
  const data = await res.json();
  return data.note;
}

