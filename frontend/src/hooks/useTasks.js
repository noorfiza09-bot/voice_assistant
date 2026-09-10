import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../lib/apiBase.js";

export function useTasks(token) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const authHeaders = useCallback(
    (extra = {}) => ({ Authorization: `Bearer ${token}`, ...extra }),
    [token]
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/tasks`, { headers: authHeaders() });
      if (!res.ok) throw new Error("Failed to load tasks");
      setTasks(await res.json());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTask = useCallback(
    async (task) => {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(task),
      });
      if (res.ok) await refresh();
      return res.ok;
    },
    [refresh, authHeaders]
  );

  const toggleComplete = useCallback(
    async (id, completed) => {
      // Optimistic update so the checkbox feels instant.
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed } : t)));
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: "PATCH",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ completed }),
      });
      if (!res.ok) await refresh(); // revert on failure
    },
    [refresh, authHeaders]
  );

  const deleteTask = useCallback(
    async (id) => {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      await fetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE", headers: authHeaders() });
    },
    [authHeaders]
  );

  return { tasks, loading, error, refresh, createTask, toggleComplete, deleteTask };
}
