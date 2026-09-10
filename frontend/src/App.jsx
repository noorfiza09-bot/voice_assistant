import { useCallback, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import VoiceOrb from "./components/VoiceOrb.jsx";
import TextCommandInput from "./components/TextCommandInput.jsx";
import TaskList from "./components/TaskList.jsx";
import Home from "./components/Home.jsx";
import CalendarView from "./components/CalendarView.jsx";
import AccountMenu from "./components/AccountMenu.jsx";
import AddTaskModal from "./components/AddTaskModal.jsx";
import AuthScreen from "./components/AuthScreen.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition.js";
import { useTasks } from "./hooks/useTasks.js";
import { useTaskNotifications } from "./hooks/useTaskNotifications.js";
import { API_BASE } from "./lib/apiBase.js";
import "./App.css";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function App() {
  const { token, user, checking, logout } = useAuth();

  if (checking) {
    return <div className="app-loading">Loading…</div>;
  }

  if (!token || !user) {
    return <AuthScreen />;
  }

  return <TaskApp token={token} user={user} onLogout={logout} />;
}

function TaskApp({ token, user, onLogout }) {
  const { tasks, loading, refresh, createTask, toggleComplete, deleteTask } = useTasks(token);
  const [activeList, setActiveList] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Tap to speak, or type a task below");
  const { permission: notifyPermission, requestPermission: enableNotifications } =
    useTaskNotifications(tasks);

  // Shared by both voice and the typed input — either way, the sentence
  // goes through the same AI intent-parsing endpoint on the backend.
  const sendCommand = useCallback(
    async (text) => {
      setStatusMessage("Thinking…");
      try {
        const res = await fetch(`${API_BASE}/api/voice/parse`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ transcript: text }),
        });
        const data = await res.json();
        setStatusMessage(data.intent?.reply || "Didn't catch that — try again.");
        await refresh();
      } catch {
        setStatusMessage("Something went wrong reaching the server.");
      }
    },
    [refresh, token]
  );

  const { supported, listening, transcript, start, stop } = useSpeechRecognition({
    onFinalTranscript: sendCommand,
  });

  function handleOrbClick() {
    if (listening) {
      stop();
    } else {
      setStatusMessage("Listening…");
      start();
    }
  }

  const counts = useMemo(() => {
    const c = { my_day: 0, important: 0, planned: 0, tasks: 0 };
    tasks.forEach((t) => {
      if (!t.completed && c[t.list_name] !== undefined) c[t.list_name] += 1;
    });
    return c;
  }, [tasks]);

  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.list_name === activeList),
    [tasks, activeList]
  );

  return (
    <div className="app-shell">
      <Sidebar
        activeList={activeList}
        onSelectList={setActiveList}
        counts={counts}
        onAddClick={() => setModalOpen(true)}
        notificationPermission={notifyPermission}
        onEnableNotifications={enableNotifications}
      />

      <main className="app-main">
        <header className="app-header">
          <div>
            <h1>{greeting()}</h1>
            <p>Speak a task, or add one yourself — either way, it lands right here.</p>
          </div>
          <AccountMenu user={user} onLogout={onLogout} />
        </header>

        <VoiceOrb
          listening={listening}
          supported={supported}
          transcript={listening ? transcript : ""}
          statusMessage={statusMessage}
          onToggle={handleOrbClick}
        />

        <div className="app-text-command">
          <TextCommandInput onSubmit={sendCommand} disabled={listening} />
        </div>

        {activeList === "home" && (
          <Home
            counts={counts}
            onNavigate={setActiveList}
            notificationPermission={notifyPermission}
            onEnableNotifications={enableNotifications}
          />
        )}

        {activeList === "calendar" && (
          <CalendarView tasks={tasks} onToggle={toggleComplete} onDelete={deleteTask} />
        )}

        {activeList !== "home" && activeList !== "calendar" && (
          <TaskList
            activeList={activeList}
            tasks={visibleTasks}
            loading={loading}
            onToggle={toggleComplete}
            onDelete={deleteTask}
          />
        )}
      </main>

      <AddTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={createTask}
        defaultList={activeList === "home" || activeList === "calendar" ? "tasks" : activeList}
      />
    </div>
  );
}
