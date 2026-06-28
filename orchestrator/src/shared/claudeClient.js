/**
 * Shared Claude API client
 */
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function askClaude(systemPrompt, userMessage, maxTokens = 4096) {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });
  return response.content.find((b) => b.type === "text")?.text ?? "";
}

export async function askClaudeStream(systemPrompt, userMessage, onChunk, maxTokens = 8192) {
  const stream = client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  let full = "";
  for await (const chunk of stream) {
    if (chunk.type === "content_block_delta" && chunk.delta?.type === "text_delta") {
      const text = chunk.delta.text;
      full += text;
      if (onChunk) onChunk(text);
    }
  }
  return full;
}
