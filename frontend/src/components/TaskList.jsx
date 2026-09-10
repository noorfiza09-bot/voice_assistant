import TaskRow from "./TaskRow.jsx";
import "./TaskList.css";

const LIST_TITLES = {
  my_day: "My Day",
  important: "Important",
  planned: "Planned",
  tasks: "Tasks",
};

export default function TaskList({ activeList, tasks, loading, onToggle, onDelete }) {
  const remaining = tasks.filter((t) => !t.completed).length;

  return (
    <section className="task-list-section">
      <div className="task-list-header">
        <h2>{LIST_TITLES[activeList]}</h2>
        <span className="task-list-count">{remaining}</span>
      </div>

      {loading ? (
        <p className="task-list-empty">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="task-list-empty">
          Nothing here yet. Tap the mic and say something like “remind me to call mom at 5pm.”
        </p>
      ) : (
        <ul className="task-list">
          {tasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              index={i}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
