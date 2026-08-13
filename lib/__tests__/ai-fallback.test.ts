/**
 * TC-0024 — REQ-0010 / CR-0002
 * Free-tier AI fallback: registry constraints + orchestration (mocked fetch, no live keys).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function chatOk(text: string): Response {
  return jsonResponse({
    choices: [{ message: { content: text } }],
  });
}

describe("AI_PROVIDERS registry (REQ-0010)", () => {
  it("OpenRouter model IDs are :free or openrouter/free", async () => {
    const { AI_PROVIDERS } = await import("../ai/providers");
    const openrouter = AI_PROVIDERS.find((p) => p.id === "openrouter");
    expect(openrouter).toBeDefined();
    for (const model of openrouter!.models) {
      expect(
        model.endsWith(":free") || model === "openrouter/free",
        model,
      ).toBe(true);
    }
  });

  it("Groq registry contains no Llama model IDs", async () => {
    const { AI_PROVIDERS } = await import("../ai/providers");
    const groq = AI_PROVIDERS.find((p) => p.id === "groq");
    expect(groq).toBeDefined();
    const banned = [
      "llama-3.1-70b-versatile",
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
    ];
    for (const model of groq!.models) {
      expect(banned.some((id) => model.includes(id) || model === id)).toBe(
        false,
      );
    }
  });

  it("Gemini uses the OpenAI-compatible host", async () => {
    const { AI_PROVIDERS } = await import("../ai/providers");
    const gemini = AI_PROVIDERS.find((p) => p.id === "gemini");
    expect(gemini?.baseUrl).toContain(
      "generativelanguage.googleapis.com/v1beta/openai",
    );
  });
});

describe("completeChat orchestration (REQ-0010)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.unstubAllEnvs();
    vi.stubEnv("GROQ_LLAMA_API_KEY", "");
    vi.stubEnv("GROQ_API_KEY", "");
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "");
    vi.stubEnv("OPENROUTER_API_KEY", "");
    vi.stubEnv("HUGGING_FACE_INFERENCE_API_KEY", "");
    vi.stubEnv("HF_TOKEN", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("skips unconfigured providers and is not a failure", async () => {
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "gemini-key");
    fetchMock.mockResolvedValueOnce(chatOk('{"ok":true}'));

    const { completeChat } = await import("../ai");
    const result = await completeChat(
      [{ role: "user", content: "hi" }],
      { temperature: 0.3, max_tokens: 50 },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("gemini");
      expect(result.text).toBe('{"ok":true}');
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("generativelanguage.googleapis.com");
  });

  it("on Groq 429 skips remaining Groq models and tries Gemini", async () => {
    vi.stubEnv("GROQ_LLAMA_API_KEY", "groq-key");
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "gemini-key");
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "rate" }, 429))
      .mockResolvedValueOnce(chatOk("from-gemini"));

    const { completeChat } = await import("../ai");
    const result = await completeChat([{ role: "user", content: "hi" }]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("gemini");
      expect(result.text).toBe("from-gemini");
    }
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toContain("api.groq.com");
    expect(String(fetchMock.mock.calls[1][0])).toContain(
      "generativelanguage.googleapis.com",
    );
  });

  it("invokes Hugging Face when earlier providers fail and HF key is set", async () => {
    vi.stubEnv("GROQ_LLAMA_API_KEY", "groq-key");
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "gemini-key");
    vi.stubEnv("OPENROUTER_API_KEY", "or-key");
    vi.stubEnv("HUGGING_FACE_INFERENCE_API_KEY", "hf-key");

    fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("router.huggingface.co")) {
        return chatOk("from-hf");
      }
      return jsonResponse({ error: "upstream" }, 503);
    });

    const { completeChat } = await import("../ai");
    const result = await completeChat([{ role: "user", content: "hi" }]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.provider).toBe("huggingface");
      expect(result.text).toBe("from-hf");
    }
    const hfCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("router.huggingface.co"),
    );
    expect(hfCalls.length).toBeGreaterThan(0);
  });

  it("classifies 402 as billing and leaves that provider", async () => {
    vi.stubEnv("GROQ_LLAMA_API_KEY", "groq-key");
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "gemini-key");
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "payment" }, 402))
      .mockResolvedValueOnce(chatOk("gemini-ok"));

    const { completeChat } = await import("../ai");
    const result = await completeChat([{ role: "user", content: "hi" }]);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.provider).toBe("gemini");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not call later providers after the first success", async () => {
    vi.stubEnv("GROQ_LLAMA_API_KEY", "groq-key");
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "gemini-key");
    vi.stubEnv("OPENROUTER_API_KEY", "or-key");
    vi.stubEnv("HUGGING_FACE_INFERENCE_API_KEY", "hf-key");
    fetchMock.mockResolvedValueOnce(chatOk("groq-first"));

    const { completeChat } = await import("../ai");
    const result = await completeChat([{ role: "user", content: "hi" }]);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.provider).toBe("groq");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("treats malformed 400 as non-retriable for that model then continues the chain", async () => {
    vi.stubEnv("GROQ_LLAMA_API_KEY", "groq-key");
    vi.stubEnv("GOOGLE_GEMINI_API_KEY", "gemini-key");
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ error: "bad request" }, 400))
      .mockResolvedValueOnce(chatOk("gemini-after-400"));

    const { completeChat } = await import("../ai");
    const result = await completeChat([{ role: "user", content: "hi" }]);

    expect(result.ok).toBe(true);
    if (result.ok) expect(result.provider).toBe("gemini");
  });
});

describe("parseJsonFromLlm (REQ-0010)", () => {
  it("extracts JSON from fenced markdown", async () => {
    const { parseJsonFromLlm } = await import("../ai/parse-json");
    const parsed = parseJsonFromLlm('```json\n{"searchTerm":"soup"}\n```');
    expect(parsed).toEqual({ searchTerm: "soup" });
  });
});
