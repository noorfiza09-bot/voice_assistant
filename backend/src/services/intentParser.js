// This is the "AI" part of the assistant: it takes raw spoken text like
// "remind me to call mom tomorrow at 5pm" and turns it into a structured
// action our server can actually execute.

import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `You are the intent-parsing engine for a voice task assistant called VoiceTask.
Given one spoken sentence from the user, output ONLY a JSON object (no prose, no markdown fences)
matching this shape:

{
  "action": "create_task" | "complete_task" | "delete_task" | "query_schedule" | "unknown",
  "title": string | null,        // short task title, e.g. "Call mom". Null if not applicable.
  "due_at": string | null,       // ISO 8601 datetime, resolved relative to "now" given below. Null if no time was mentioned.
  "priority": "low" | "normal" | "high",
  "list_name": "my_day" | "important" | "planned" | "tasks",
  "search_title": string | null, // for complete_task/delete_task: text to match against an existing task's title
  "reply": string                // one short, friendly sentence confirming what you understood, spoken back to the user
}

Rules:
- "remind me to X", "add X", "I need to X" -> create_task
- "mark X as done", "I finished X", "complete X" -> complete_task
- "delete X", "remove X", "cancel X" -> delete_task
- "what's on my schedule", "what do I have today" -> query_schedule
- If the user marks something urgent/important, set priority "high" and list_name "important".
- If a task has a specific due date/time, list_name should be "planned"; if it's due today, use "my_day".
- If you can't confidently parse the sentence, use action "unknown" and explain in "reply".
- Never invent a title or time that wasn't implied by the sentence.`;

/**
 * @param {string} transcript - the raw text from Web Speech API
 * @returns {Promise<object>} structured intent, see SYSTEM_PROMPT shape
 */
export async function parseIntent(transcript) {
  const now = new Date().toISOString();

  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Current time: ${now}\nUser said: "${transcript}"` },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";

  try {
    return JSON.parse(raw);
  } catch {
    return {
      action: "unknown",
      title: null,
      due_at: null,
      priority: "normal",
      list_name: "tasks",
      search_title: null,
      reply: "I didn't quite catch that — could you say it again?",
    };
  }
}
