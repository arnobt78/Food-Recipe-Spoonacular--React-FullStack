/**
 * REQ-0010 / CR-0002 — Layer 1 provider registry (data, not clients).
 * Order is fallback priority: Groq → Gemini → OpenRouter :free → Hugging Face.
 * Swap model IDs here when a free tier deprecates; do not fork per-route fetch code.
 */

import type { AiProviderConfig } from "./types";

const APP_REFERER =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3000";

/** Frozen 2026-08-13 — Groq Llama IDs are deprecated/shut down; use gpt-oss / qwen3.6 only. */
export const AI_PROVIDERS: readonly AiProviderConfig[] = [
  {
    id: "groq",
    label: "Groq",
    envKeys: ["GROQ_LLAMA_API_KEY", "GROQ_API_KEY"],
    baseUrl: "https://api.groq.com/openai/v1",
    models: ["openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"],
  },
  {
    id: "gemini",
    label: "Google Gemini",
    envKeys: ["GOOGLE_GEMINI_API_KEY"],
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-2.5-flash", "gemini-2.5-flash-lite"],
  },
  {
    id: "openrouter",
    label: "OpenRouter",
    envKeys: ["OPENROUTER_API_KEY"],
    baseUrl: "https://openrouter.ai/api/v1",
    // Every ID must be :free or the free router — never paid slugs (claude / gpt-4o-mini).
    models: ["openai/gpt-oss-20b:free", "openrouter/free"],
    extraHeaders: {
      "HTTP-Referer": APP_REFERER,
      "X-Title": "Recipe Smart App",
    },
  },
  {
    id: "huggingface",
    label: "Hugging Face",
    envKeys: ["HUGGING_FACE_INFERENCE_API_KEY", "HF_TOKEN"],
    baseUrl: "https://router.huggingface.co/v1",
    models: ["openai/gpt-oss-20b:fastest", "openai/gpt-oss-120b:fastest"],
  },
];

/** First non-empty env value for a provider, or undefined if unconfigured. */
export function getProviderApiKey(provider: AiProviderConfig): string | undefined {
  for (const key of provider.envKeys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}
