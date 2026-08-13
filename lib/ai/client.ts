/**
 * REQ-0010 / CR-0002 — Layer 2 generic OpenAI-compatible chat client.
 * Never throws: every outcome is a ChatResult so the orchestrator can fall through.
 */

import type {
  AiProviderConfig,
  ChatFailure,
  ChatMessage,
  ChatOptions,
  ChatResult,
} from "./types";

const REQUEST_TIMEOUT_MS = 12_000;

type ChatCompletionBody = {
  choices?: Array<{ message?: { content?: string | null } }>;
};

function classifyHttp(status: number): ChatFailure["kind"] {
  if (status === 402) return "billing";
  if (status === 429) return "rate_limit";
  return "upstream";
}

/** True when the orchestrator should try the next model in the same provider. */
export function shouldTryNextModel(failure: ChatFailure): boolean {
  if (failure.kind === "rate_limit" || failure.kind === "billing") return false;
  if (failure.status !== undefined && failure.status >= 400 && failure.status < 500) {
    if (failure.status === 408) return true;
    return false;
  }
  return failure.kind === "upstream";
}

/** True when remaining models of this provider should be skipped (try next provider). */
export function shouldSkipProvider(failure: ChatFailure): boolean {
  return (
    failure.kind === "rate_limit" ||
    failure.kind === "billing" ||
    (failure.status !== undefined &&
      failure.status >= 400 &&
      failure.status < 500 &&
      failure.status !== 408)
  );
}

export async function postChatCompletion(
  provider: AiProviderConfig,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  const url = `${provider.baseUrl.replace(/\/$/, "")}/chat/completions`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(provider.extraHeaders ?? {}),
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: options.max_tokens ?? 400,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const kind = classifyHttp(response.status);
      return {
        ok: false,
        kind,
        provider: provider.id,
        model,
        status: response.status,
        message: `HTTP ${response.status}`,
      };
    }

    let data: ChatCompletionBody;
    try {
      data = (await response.json()) as ChatCompletionBody;
    } catch {
      return {
        ok: false,
        kind: "upstream",
        provider: provider.id,
        model,
        message: "Malformed JSON body",
      };
    }

    const text = data.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) {
      return {
        ok: false,
        kind: "upstream",
        provider: provider.id,
        model,
        message: "Empty completion",
      };
    }

    return { ok: true, text, provider: provider.id, model };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return {
      ok: false,
      kind: "upstream",
      provider: provider.id,
      model,
      message,
    };
  }
}
