import { useMemo, useState } from "react";
import TaskRow from "./TaskRow.jsx";
import "./CalendarView.css";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthCells(year, month) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = Array(firstWeekday).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function CalendarView({ tasks, onToggle, onDelete }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(today);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const cells = useMemo(() => buildMonthCells(year, month), [year, month]);

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach((task) => {
      if (!task.due_at) return;
      const due = new Date(task.due_at);
      if (due.getFullYear() === year && due.getMonth() === month) {
        map[due.getDate()] = (map[due.getDate()] || 0) + 1;
      }
    });
    return map;
  }, [tasks, year, month]);

  const agenda = useMemo(
    () => tasks.filter((t) => t.due_at && sameDay(new Date(t.due_at), selectedDay)),
    [tasks, selectedDay]
  );

  function goToMonth(delta) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <section className="calendar-view">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={() => goToMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <h2>{cursor.toLocaleDateString([], { month: "long", year: "numeric" })}</h2>
        <button className="calendar-nav-btn" onClick={() => goToMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((day, i) => {
          if (!day) return <span key={i} className="calendar-cell calendar-cell-empty" aria-hidden="true" />;

          const date = new Date(year, month, day);
          const isToday = sameDay(date, today);
          const isSelected = sameDay(date, selectedDay);

          return (
            <button
              key={i}
              className={`calendar-cell ${isToday ? "is-today" : ""} ${isSelected ? "is-selected" : ""}`}
              onClick={() => setSelectedDay(date)}
            >
              {day}
              {tasksByDay[day] && <span className="calendar-dot" />}
            </button>
          );
        })}
      </div>

      <div className="calendar-agenda">
        <h3>
          {selectedDay.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
        </h3>

        {agenda.length === 0 ? (
          <p className="calendar-agenda-empty">Nothing due this day.</p>
        ) : (
          <ul className="task-list">
            {agenda.map((task, i) => (
              <TaskRow key={task.id} task={task} index={i} onToggle={onToggle} onDelete={onDelete} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
