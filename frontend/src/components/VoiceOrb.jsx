import WaveBanner from "./WaveBanner.jsx";
import "./VoiceOrb.css";

export default function VoiceOrb({
  listening,
  supported,
  transcript,
  statusMessage,
  onToggle,
}) {
  return (
    <div className="voice-orb-wrap">
      <div className="voice-orb-banner">
        <WaveBanner intensity={listening ? "listening" : "idle"} />
      </div>

      <button
        className={`voice-orb ${listening ? "is-listening" : ""}`}
        onClick={onToggle}
        disabled={!supported}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening" : "Start speaking a task"}
      >
        <span className="voice-orb-rings" aria-hidden="true">
          <span className="ring ring-1" />
          <span className="ring ring-2" />
          <span className="ring ring-3" />
        </span>

        <span className="voice-orb-core" aria-hidden="true">
          {listening ? (
            <span className="waveform">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`wave-bar wave-bar-${i}`} />
              ))}
            </span>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <rect x="9" y="2" width="6" height="12" rx="3" fill="currentColor" />
              <path
                d="M5 11a7 7 0 0 0 14 0M12 18v3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      </button>

      <p className="voice-orb-status">
        {!supported
          ? "Voice input isn't supported in this browser — try Chrome or Edge."
          : statusMessage}
      </p>

      {transcript && <p className="voice-orb-transcript">“{transcript}”</p>}
    </div>
  );
}
