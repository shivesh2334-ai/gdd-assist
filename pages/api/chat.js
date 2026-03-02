import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../../lib/knowledge-base";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array required" });
  }

  try {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("Access-Control-Allow-Origin", "*");

    const stream = await client.messages.stream({
      model: "claude-opus-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("API Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error", details: error.message });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
}

export const config = {
  api: {
    responseLimit: false,
  },
};
