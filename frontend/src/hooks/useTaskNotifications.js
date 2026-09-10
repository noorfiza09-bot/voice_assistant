import { useEffect, useRef, useState } from "react";

const SUPPORTED = typeof window !== "undefined" && "Notification" in window;
const MAX_DELAY = 1000 * 60 * 60 * 24 * 20; // setTimeout is unreliable past ~24 days

// Schedules a browser notification to fire at each task's due_at, for as
// long as this tab stays open. Re-syncs whenever the task list changes:
// new due tasks get scheduled, completed/deleted ones get their timer
// cancelled, so nothing fires for a task you already finished.
export function useTaskNotifications(tasks) {
  const [permission, setPermission] = useState(SUPPORTED ? Notification.permission : "unsupported");
  const timers = useRef(new Map());

  async function requestPermission() {
    if (!SUPPORTED) return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  useEffect(() => {
    if (!SUPPORTED || permission !== "granted") return;

    const activeIds = new Set(tasks.map((t) => t.id));

    // Drop timers for tasks that were completed, deleted, or lost their due date.
    timers.current.forEach((timeoutId, id) => {
      const stillDue = tasks.find((t) => t.id === id && !t.completed && t.due_at);
      if (!stillDue || !activeIds.has(id)) {
        clearTimeout(timeoutId);
        timers.current.delete(id);
      }
    });

    tasks.forEach((task) => {
      if (task.completed || !task.due_at) return;
      if (timers.current.has(task.id)) return; // already scheduled

      const delay = new Date(task.due_at).getTime() - Date.now();
      if (delay <= 0 || delay > MAX_DELAY) return; // already past, or too far out to trust setTimeout

      const timeoutId = setTimeout(() => {
        new Notification("VoiceTask reminder", {
          body: task.title,
          tag: `voicetask-${task.id}`,
        });
        timers.current.delete(task.id);
      }, delay);

      timers.current.set(task.id, timeoutId);
    });
  }, [tasks, permission]);

  // Clean up every scheduled timer if the component unmounts (e.g. logout).
  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((id) => clearTimeout(id));
  }, []);

  return { supported: SUPPORTED, permission, requestPermission };
}
