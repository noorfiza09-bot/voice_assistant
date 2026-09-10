import { useState } from "react";
import "./TextCommandInput.css";

export default function TextCommandInput({ onSubmit, disabled }) {
  const [value, setValue] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const text = value.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    await onSubmit(text);
    setValue("");
    setSubmitting(false);
  }

  return (
    <form className="text-command" onSubmit={handleSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Or type a task — “remind me to call mom at 5pm”"
        disabled={disabled || submitting}
      />
      <button
        type="submit"
        className="text-command-send"
        disabled={disabled || submitting || !value.trim()}
        aria-label="Send"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
          <path
            d="M2 8h11M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
