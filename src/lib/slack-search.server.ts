export async function slackRealtimeSearch(
  botToken: string,
  query: string,
): Promise<Array<{ channel_name?: string; user_name?: string; text: string; permalink?: string }>> {
  try {
    const res = await fetch("https://slack.com/api/assistant.search.context", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${botToken}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify({
        query,
        content_types: ["messages"],
        include_context_messages: true,
        limit: 15,
      }),
    });
    const data = (await res.json()) as any;
    if (!data.ok) {
      console.warn("assistant.search.context not ok:", data.error);
      return [];
    }
    const results = data?.results?.messages ?? data?.messages ?? [];
    return results
      .map((m: any) => ({
        channel_name: m.channel?.name ?? m.channel_name,
        user_name: m.author_user_name ?? m.user_name ?? m.username,
        text: m.message_content?.text ?? m.text ?? "",
        permalink: m.permalink,
      }))
      .filter((r: any) => r.text);
  } catch (err) {
    console.warn("assistant.search.context failed:", err);
    return [];
  }
}
