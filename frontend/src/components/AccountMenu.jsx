import { useEffect, useRef, useState } from "react";
import "./AccountMenu.css";

export default function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        className="account-avatar"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Account menu"
      >
        {initial}
      </button>

      {open && (
        <div className="account-dropdown">
          <p className="account-dropdown-email">{user?.email}</p>
          <button
            className="account-dropdown-logout"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
