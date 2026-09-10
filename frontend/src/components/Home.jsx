import "./Home.css";

const ICONS = {
  sun: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 1.5v2M10 16.5v2M18.5 10h-2M3.5 10h-2M15.9 4.1l-1.4 1.4M5.5 14.5l-1.4 1.4M15.9 15.9l-1.4-1.4M5.5 5.5 4.1 4.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  star: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2l2.2 5.6 6 .5-4.6 3.9 1.5 5.9L10 14.8l-5.1 3.1 1.5-5.9-4.6-3.9 6-.5L10 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  ),
  calendar: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2.5" y="4" width="15" height="13.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2.5 8h15M6.5 2v3.5M13.5 2v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M7 5h10M7 10h10M7 15h10M2.5 5h.01M2.5 10h.01M2.5 15h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  ),
  bell: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 2a3.6 3.6 0 0 0-3.6 3.6v1.4c0 .7-.3 1.5-.7 2.1L4 12h12l-1.7-2.9a3.9 3.9 0 0 1-.7-2.1V5.6A3.6 3.6 0 0 0 10 2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M7.8 15a2.2 2.2 0 0 0 4.2 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const CARDS = [
  { key: "my_day", label: "My Day", hint: "Due today", icon: "sun", tone: "tone-a" },
  { key: "important", label: "Important", hint: "High priority", icon: "star", tone: "tone-b" },
  { key: "planned", label: "Planned", hint: "Scheduled", icon: "calendar", tone: "tone-c" },
  { key: "tasks", label: "Tasks", hint: "Everything else", icon: "list", tone: "tone-a" },
];

export default function Home({ counts, onNavigate, notificationPermission, onEnableNotifications }) {
  return (
    <section className="home-grid">
      {CARDS.map((card, i) => (
        <button
          key={card.key}
          className={`home-card ${card.tone}`}
          style={{ animationDelay: `${i * 70}ms` }}
          onClick={() => onNavigate(card.key)}
        >
          <span className="home-card-glow" aria-hidden="true" />
          <span className="home-card-icon">{ICONS[card.icon]}</span>
          <span className="home-card-stat">{counts[card.key] ?? 0}</span>
          <span className="home-card-label">{card.label}</span>
          <span className="home-card-hint">{card.hint}</span>
        </button>
      ))}

      <button
        className="home-card home-card-wide tone-c"
        style={{ animationDelay: "280ms" }}
        onClick={() => onNavigate("calendar")}
      >
        <span className="home-card-glow" aria-hidden="true" />
        <span className="home-card-icon">{ICONS.calendar}</span>
        <span className="home-card-label">Calendar</span>
        <span className="home-card-hint">See what's due, by date</span>
      </button>

      <button
        className={`home-card home-card-wide tone-b ${notificationPermission === "granted" ? "is-active" : ""}`}
        style={{ animationDelay: "350ms" }}
        onClick={onEnableNotifications}
        disabled={notificationPermission === "granted" || notificationPermission === "denied"}
      >
        <span className="home-card-glow" aria-hidden="true" />
        <span className="home-card-icon">{ICONS.bell}</span>
        <span className="home-card-label">
          {notificationPermission === "granted"
            ? "Reminders on"
            : notificationPermission === "denied"
            ? "Reminders blocked"
            : "Reminders"}
        </span>
        <span className="home-card-hint">
          {notificationPermission === "granted"
            ? "You'll be notified when tasks are due"
            : "Tap to enable due-time alerts"}
        </span>
      </button>
    </section>
  );
}
