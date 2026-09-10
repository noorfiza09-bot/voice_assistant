import { useState } from "react";
import "./AddTaskModal.css";

export default function AddTaskModal({ open, onClose, onCreate, defaultList }) {
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [priority, setPriority] = useState("normal");

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    await onCreate({
      title: title.trim(),
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
      priority,
      list_name: defaultList,
    });
    setTitle("");
    setDueAt("");
    setPriority("normal");
    onClose();
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal-panel" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3>Add a task</h3>

        <label className="modal-field">
          <span>Title</span>
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Submit assignment"
          />
        </label>

        <label className="modal-field">
          <span>Due</span>
          <input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
        </label>

        <label className="modal-field">
          <span>Priority</span>
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" className="modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="modal-submit">
            Add task
          </button>
        </div>
      </form>
    </div>
  );
}
