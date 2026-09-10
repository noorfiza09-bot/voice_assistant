import { Router } from "express";
import { query } from "../db.js";

const router = Router();

// GET /api/tasks?list=my_day  — list the signed-in user's tasks
router.get("/", async (req, res) => {
  const { list } = req.query;
  try {
    const result = list
      ? await query(
          `SELECT * FROM tasks WHERE user_id = $1 AND list_name = $2
           ORDER BY completed ASC, due_at ASC NULLS LAST, created_at DESC`,
          [req.userId, list]
        )
      : await query(
          `SELECT * FROM tasks WHERE user_id = $1
           ORDER BY completed ASC, due_at ASC NULLS LAST, created_at DESC`,
          [req.userId]
        );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load tasks." });
  }
});

// POST /api/tasks — create a task manually (voice goes through /api/voice instead)
router.post("/", async (req, res) => {
  const { title, notes, due_at, priority, list_name } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "A task needs a title." });
  }
  try {
    const result = await query(
      `INSERT INTO tasks (user_id, title, notes, due_at, priority, list_name)
       VALUES ($1, $2, $3, $4, COALESCE($5, 'normal'), COALESCE($6, 'tasks'))
       RETURNING *`,
      [req.userId, title.trim(), notes ?? null, due_at ?? null, priority ?? null, list_name ?? null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create the task." });
  }
});

// PATCH /api/tasks/:id — update any subset of fields, e.g. { completed: true }
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const fields = ["title", "notes", "due_at", "priority", "list_name", "completed"];
  const updates = [];
  const values = [];

  fields.forEach((field) => {
    if (field in req.body) {
      values.push(req.body[field]);
      updates.push(`${field} = $${values.length}`);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: "Nothing to update." });
  }

  values.push(id, req.userId);
  try {
    const result = await query(
      `UPDATE tasks SET ${updates.join(", ")}
       WHERE id = $${values.length - 1} AND user_id = $${values.length}
       RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update the task." });
  }
});

// DELETE /api/tasks/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await query("DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id", [
      req.params.id,
      req.userId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found." });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete the task." });
  }
});

export default router;
