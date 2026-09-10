// In development this is empty, so fetch("/api/...") stays relative and
// Vite's dev proxy (see vite.config.js) forwards it to the local backend.
// In production, set VITE_API_URL to your deployed backend's URL (e.g.
// https://voicetask-backend.onrender.com) and every request below will
// point there instead.
export const API_BASE = import.meta.env.VITE_API_URL || "";
