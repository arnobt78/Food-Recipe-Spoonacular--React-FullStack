/**
 * REQ-0010 / CR-0002 — Layer 3 orchestration.
 * Inner loop: models of one provider. Outer loop: configured providers in registry order.
 * Unconfigured providers are skipped (not failures). Never throws.
 */

import { postChatCompletion, shouldSkipProvider, shouldTryNextModel } from "./client";
import { AI_PROVIDERS, getProviderApiKey } from "./providers";
import type { ChatFailure, ChatMessage, ChatOptions, ChatResult } from "./types";

export { AI_PROVIDERS, getProviderApiKey } from "./providers";
export {
  parseJsonFromLlm,
  parseJsonObjectFromLlm,
  parseJsonStringArrayFromLlm,
} from "./parse-json";
export type { ChatMessage, ChatOptions, ChatResult } from "./types";

/**
 * Complete a chat against the free-tier fallback chain.
 * First success wins; last failure is returned if every configured provider fails.
 */
export async function completeChat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<ChatResult> {
  let lastFailure: ChatFailure = {
    ok: false,
    kind: "not_configured",
    message: "No AI API keys configured (Groq, Gemini, OpenRouter, or Hugging Face)",
  };
  let sawConfigured = false;

  for (const provider of AI_PROVIDERS) {
    const apiKey = getProviderApiKey(provider);
    if (!apiKey) continue;
    sawConfigured = true;

    for (const model of provider.models) {
      const result = await postChatCompletion(
        provider,
        apiKey,
        model,
        messages,
        options,
      );
      if (result.ok) return result;

      lastFailure = result;
      if (shouldSkipProvider(result)) break;
      if (!shouldTryNextModel(result)) break;
    }
  }

  if (!sawConfigured) {
    return {
      ok: false,
      kind: "not_configured",
      message: lastFailure.message,
    };
  }

  return lastFailure;
}
