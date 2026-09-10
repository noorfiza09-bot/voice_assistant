import "./Sidebar.css";

const LISTS = [
  { key: "home", label: "Home" },
  { key: "my_day", label: "My Day" },
  { key: "important", label: "Important" },
  { key: "planned", label: "Planned" },
  { key: "tasks", label: "Tasks" },
  { key: "calendar", label: "Calendar" },
];

export default function Sidebar({
  activeList,
  onSelectList,
  counts,
  onAddClick,
  notificationPermission,
  onEnableNotifications,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true" />
        <span className="sidebar-brand-name">VoiceTask</span>
      </div>

      <nav className="sidebar-nav" aria-label="Views">
        {LISTS.map(({ key, label }) => (
          <button
            key={key}
            className={`sidebar-nav-item ${activeList === key ? "is-active" : ""}`}
            onClick={() => onSelectList(key)}
            aria-current={activeList === key ? "true" : undefined}
          >
            <span className="sidebar-nav-dot" aria-hidden="true" />
            <span>{label}</span>
            {counts[key] > 0 && <span className="sidebar-nav-count">{counts[key]}</span>}
          </button>
        ))}
      </nav>

      {notificationPermission !== "unsupported" && (
        <button
          className={`sidebar-notify ${notificationPermission === "granted" ? "is-on" : ""}`}
          onClick={onEnableNotifications}
          disabled={notificationPermission === "granted" || notificationPermission === "denied"}
        >
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5a3 3 0 0 0-3 3v1.2c0 .6-.2 1.2-.6 1.7L3 9.5h10L11.6 7.4a2.6 2.6 0 0 1-.6-1.7V4.5a3 3 0 0 0-3-3Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <path d="M6.3 12a1.8 1.8 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span>
            {notificationPermission === "granted"
              ? "Reminders on"
              : notificationPermission === "denied"
              ? "Reminders blocked"
              : "Enable reminders"}
          </span>
        </button>
      )}

      <button className="sidebar-add" onClick={onAddClick}>
        + Add a task
      </button>
    </aside>
  );
}
