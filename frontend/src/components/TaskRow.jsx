import "./TaskRow.css";

function formatDue(dueAt) {
  if (!dueAt) return null;
  const date = new Date(dueAt);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (isToday) return time;
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;
}

export default function TaskRow({ task, index = 0, onToggle, onDelete }) {
  const due = formatDue(task.due_at);

  return (
    <li
      className={`task-row priority-${task.priority} ${task.completed ? "is-done" : ""}`}
      style={{ animationDelay: `${Math.min(index, 10) * 40}ms` }}
    >
      <button
        className="task-checkbox"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
        onClick={() => onToggle(task.id, !task.completed)}
      >
        {task.completed && (
          <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
            <path d="M1 4.5L4 7.5L10 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <span className="task-title">{task.title}</span>

      {due && <span className="task-due">{task.completed ? "Done" : due}</span>}

      <button
        className="task-delete"
        aria-label={`Delete "${task.title}"`}
        onClick={() => onDelete(task.id)}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
