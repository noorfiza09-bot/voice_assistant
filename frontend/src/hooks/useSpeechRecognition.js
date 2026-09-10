import { useCallback, useEffect, useRef, useState } from "react";

// Wraps the browser's Web Speech API (SpeechRecognition) in a small React hook.
// Chrome/Edge only ship the prefixed webkitSpeechRecognition, so we check both.
const SpeechRecognitionAPI =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useSpeechRecognition({ onFinalTranscript } = {}) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognitionAPI) return;

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setError(null);
      setListening(true);
    };

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const chunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalText += chunk;
        } else {
          interimText += chunk;
        }
      }

      if (finalText) {
        setTranscript(finalText);
        onFinalTranscript?.(finalText.trim());
      } else {
        setTranscript(interimText);
      }
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onFinalTranscript]);

  const start = useCallback(() => {
    if (!recognitionRef.current || listening) return;
    setTranscript("");
    recognitionRef.current.start();
  }, [listening]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    supported: Boolean(SpeechRecognitionAPI),
    listening,
    transcript,
    error,
    start,
    stop,
  };
}
