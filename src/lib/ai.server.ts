// Server-only helper for Lovable AI Gateway (OpenAI-compatible endpoint).

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

type Msg = { role: "system" | "user" | "assistant"; content: string };

async function call(messages: Msg[], jsonMode: boolean): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    if (res.status === 429) throw new Error("AI rate limit — please retry in a moment.");
    if (res.status === 402)
      throw new Error("AI credits exhausted. Add credits in Lovable settings.");
    throw new Error(`AI error ${res.status}: ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

export async function aiText(system: string, user: string): Promise<string> {
  return call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    false,
  );
}

export async function aiJSON<T = unknown>(system: string, user: string): Promise<T> {
  const raw = await call(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    true,
  );
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Try to extract JSON block
    const match = raw.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]) as T;
    throw new Error("AI returned non-JSON output");
  }
}
