import { Router } from "express";
import { query } from "../db.js";
import { parseIntent } from "../services/intentParser.js";

const router = Router();

// POST /api/voice/parse  { transcript: "remind me to call mom tomorrow at 5pm" }
// Parses the sentence with OpenAI, executes the resulting action against the
// database (scoped to the signed-in user), and returns the intent + reply.
router.post("/parse", async (req, res) => {
  const { transcript } = req.body;
  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: "No transcript was sent." });
  }

  let intent;
  try {
    intent = await parseIntent(transcript.trim());
  } catch (err) {
    console.error("OpenAI intent parsing failed:", err);
    return res.status(502).json({ error: "Couldn't reach the AI parser. Try again." });
  }

  try {
    let task = null;

    switch (intent.action) {
      case "create_task": {
        if (!intent.title) break;
        const result = await query(
          `INSERT INTO tasks (user_id, title, due_at, priority, list_name)
           VALUES ($1, $2, $3, $4, $5) RETURNING *`,
          [
            req.userId,
            intent.title,
            intent.due_at,
            intent.priority || "normal",
            intent.list_name || "tasks",
          ]
        );
        task = result.rows[0];
        break;
      }

      case "complete_task": {
        if (!intent.search_title) break;
        const result = await query(
          `UPDATE tasks SET completed = TRUE
           WHERE id = (
             SELECT id FROM tasks
             WHERE user_id = $1 AND title ILIKE '%' || $2 || '%' AND completed = FALSE
             ORDER BY created_at DESC LIMIT 1
           )
           RETURNING *`,
          [req.userId, intent.search_title]
        );
        task = result.rows[0] || null;
        break;
      }

      case "delete_task": {
        if (!intent.search_title) break;
        const result = await query(
          `DELETE FROM tasks
           WHERE id = (
             SELECT id FROM tasks
             WHERE user_id = $1 AND title ILIKE '%' || $2 || '%'
             ORDER BY created_at DESC LIMIT 1
           )
           RETURNING *`,
          [req.userId, intent.search_title]
        );
        task = result.rows[0] || null;
        break;
      }

      case "query_schedule":
      case "unknown":
      default:
        break;
    }

    res.json({ intent, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Understood you, but couldn't update the database." });
  }
});

export default router;
