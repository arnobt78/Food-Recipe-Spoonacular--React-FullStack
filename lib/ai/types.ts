/**
 * REQ-0010 / CR-0002 — shared chat types for the free-tier fallback client.
 * Discriminated results never throw; callers check `ok` and continue or degrade.
 */

export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatOptions = {
  temperature?: number;
  max_tokens?: number;
};

export type ChatFailureKind =
  | "not_configured"
  | "billing"
  | "rate_limit"
  | "upstream";

export type ChatSuccess = {
  ok: true;
  text: string;
  provider: string;
  model: string;
};

export type ChatFailure = {
  ok: false;
  kind: ChatFailureKind;
  provider?: string;
  model?: string;
  status?: number;
  message?: string;
};

export type ChatResult = ChatSuccess | ChatFailure;

export type AiProviderId = "groq" | "gemini" | "openrouter" | "huggingface";

export type AiProviderConfig = {
  id: AiProviderId;
  label: string;
  /** Env keys tried in order; first non-empty wins. */
  envKeys: readonly string[];
  baseUrl: string;
  models: readonly string[];
  extraHeaders?: Record<string, string>;
};
