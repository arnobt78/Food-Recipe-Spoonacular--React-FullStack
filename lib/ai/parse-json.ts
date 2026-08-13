/**
 * REQ-0010 / CR-0002 — extract JSON from LLM text (fenced markdown or raw object/array).
 * Mirrors the catch-all route's previous per-site regex without duplicating it.
 */

export function parseJsonFromLlm(text: string): Record<string, unknown> | unknown[] | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;

  try {
    return JSON.parse(candidate) as Record<string, unknown> | unknown[];
  } catch {
    const objectMatch = candidate.match(/{[\s\S]*}/);
    const arrayMatch = candidate.match(/\[[\s\S]*\]/);
    const snippet = objectMatch?.[0] ?? arrayMatch?.[0];
    if (!snippet) return null;
    try {
      return JSON.parse(snippet) as Record<string, unknown> | unknown[];
    } catch {
      return null;
    }
  }
}

export function parseJsonObjectFromLlm(
  text: string,
): Record<string, unknown> | null {
  const parsed = parseJsonFromLlm(text);
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    return parsed as Record<string, unknown>;
  }
  return null;
}

export function parseJsonStringArrayFromLlm(text: string): string[] | null {
  const parsed = parseJsonFromLlm(text);
  if (!Array.isArray(parsed)) return null;
  const strings = parsed.filter((item): item is string => typeof item === "string");
  return strings.length > 0 ? strings : null;
}
