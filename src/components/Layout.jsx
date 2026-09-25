import React, { useEffect, useRef, useCallback, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useApp } from "../context/AppContext";
import { speak, playConfirmationTone } from "../utils/voice";
import { notifyParentInattentive } from "../utils/notifyParent";
import * as faceapi from "face-api.js";

/** Novelty: Calm moment – child can pause and take a short, predictable break. */
function CalmMomentOverlay({ onReady }) {
  const [breathPhase, setBreathPhase] = useState("in");
  useEffect(() => {
    const t = setInterval(
      () => setBreathPhase((p) => (p === "in" ? "out" : "in")),
      3000,
    );
    return () => clearInterval(t);
  }, []);
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(230, 220, 210, 0.97)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: 24,
      }}
      aria-label="Calm moment – take a breath"
    >
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #87CEEB, #B0E0E6)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          animation:
            breathPhase === "in"
              ? "calmBreathIn 3s ease-in-out"
              : "calmBreathOut 3s ease-in-out",
        }}
      />
      <p
        style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#1a1a1a",
          textAlign: "center",
          maxWidth: 320,
        }}
      >
        Let&apos;s take a calm breath. When you&apos;re ready, we&apos;ll
        continue.
      </p>
      <button
        type="button"
        onClick={() => {
          speak("You are ready. Let us continue.");
          onReady();
        }}
        style={{
          padding: "18px 36px",
          fontSize: "1.2rem",
          fontWeight: 700,
          borderRadius: 999,
          border: "none",
          background: "#2ECC71",
          color: "#fff",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(46, 204, 113, 0.4)",
        }}
      >
        I&apos;m ready
      </button>
      <style>{`
        @keyframes calmBreathIn {
          0%, 100% { transform: scale(0.85); opacity: 0.9; }
          50% { transform: scale(1.15); opacity: 1; }
        }
        @keyframes calmBreathOut {
          0%, 100% { transform: scale(1.15); opacity: 1; }
          50% { transform: scale(0.85); opacity: 0.9; }
        }
      `}</style>
    </div>
  );
}

const pageInstructions = {
  "/home": "Choose a game. Tap Listening, Speaking, Reading, or Writing.",
  "/listening": "This is the Listening game. Tap Start to play.",
  "/listening/play": "Listen and click the right answer.",
  "/speaking": "This is the Speaking game. Tap Start to play.",
  "/speaking/play": "Listen and click what you hear.",
  "/reading": "This is the Reading game. Tap Start to play.",
  "/reading/play": "Read the sentence and click the right answer.",
  "/writing": "This is the Writing game. Tap Start to play.",
  "/writing/play": "Listen to the word and click the correct spelling.",
};

/* Camera: live feed only, plus face-presence detection for a real attentiveness signal.
   Not recorded or stored (no MediaRecorder, no upload). */
function CameraMonitor({ onFaceStatusChange }) {
  const videoRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    let stream;
    let detectionInterval;
    const missedChecksRef = { current: 0 };

    const start = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        setModelsLoaded(true);

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }

        detectionInterval = setInterval(async () => {
          if (!videoRef.current) return;
          const detection = await faceapi.detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions(),
          );

          if (detection) {
            missedChecksRef.current = 0;
            onFaceStatusChange?.(true);
          } else {
            missedChecksRef.current += 1;
            if (missedChecksRef.current >= 3) {
              onFaceStatusChange?.(false);
              missedChecksRef.current = 0;
            }
          }
        }, 2000);
      } catch (e) {
        console.error("Camera or face detection unavailable", e);
      }
    };
    start();

    return () => {
      stream?.getTracks().forEach((t) => t.stop());
      if (detectionInterval) clearInterval(detectionInterval);
    };
  }, [onFaceStatusChange]);

  return (
    <div style={styles.cameraPlaceholder}>
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          objectFit: "cover",
        }}
        muted
        playsInline
      />
      {!modelsLoaded && (
        <p style={{ fontSize: "0.85rem", color: "#999", marginTop: 4 }}>
          Loading face detection...
        </p>
      )}
    </div>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "linear-gradient(135deg, #e8d5c4, #f0e6dc)",
    fontFamily: '"Nunito", system-ui, sans-serif',
    color: "#1a1a1a",
  },
  main: {
    flex: 1,
    display: "flex",
    gap: 24,
    padding: 24,
    maxWidth: 1400,
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  content: {
    flex: 2,
    minWidth: 0,
  },
  sidebar: {
    flex: 1,
    minWidth: 280,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cameraCard: {
    borderRadius: 24,
    background: "#fff",
    padding: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  cameraPlaceholder: {
    marginTop: 12,
    borderRadius: 18,
    border: "2px dashed #FFBFA3",
    background: "#FFF7F0",
    height: 220,
    overflow: "hidden",
  },
  sectionTitle: { fontSize: "1.2rem", margin: 0, color: "#1a1a1a" },
  helperText: { fontSize: "0.95rem", color: "#333", marginTop: 8 },
};

export default function Layout() {
  const {
    registeredChild,
    calmMomentActive,
    setCalmMomentActive,
    incrementInattentive,
    incrementCalmActivated,
    incrementCalmResumed,
    sessionStats,
  } = useApp();
  const location = useLocation();
  const path = location.pathname;

  const handleInattentive = useCallback(
    (source = "unknown") => {
      console.log(`Inattentive triggered by: ${source}`);
      speak("Quick check-in! Are you still with me?");
      playConfirmationTone();
      incrementInattentive();
      const email = registeredChild?.parentEmail;
      const name = registeredChild?.childName;
      if (email && name) {
        notifyParentInattentive(email, name).catch((err) =>
          console.error("Inattentiveness email failed", err),
        );
      }
    },
    [registeredChild, incrementInattentive],
  );

  useEffect(() => {
    const instruction = pageInstructions[path] || pageInstructions["/home"];
    speak(instruction);
  }, [path]);

  useEffect(() => {
    if (!registeredChild || calmMomentActive) return;
    const intervalMs = 90 * 1000;
    const id = setInterval(
      () => handleInattentive("90-second timer"),
      intervalMs,
    );
    return () => clearInterval(id);
  }, [registeredChild, calmMomentActive, handleInattentive]);

  const MAX_CALM_ACTIVATIONS = 3;

  const handleCalmMomentStart = useCallback(() => {
    if (sessionStats.calmModeActivatedCount >= MAX_CALM_ACTIVATIONS) {
      speak(
        "You've used all your calm moments for now. Let's keep going — you're doing great!",
      );
      return;
    }
    incrementCalmActivated();
    setCalmMomentActive(true);
    speak(
      "Let us take a calm moment. Breathe with the circle. When you are ready, tap I am ready.",
    );
  }, [setCalmMomentActive, incrementCalmActivated, sessionStats]);

  // Face-presence detection: independent signal from the 90s timer, with a cooldown
  const lastFaceAlertRef = useRef(0);
  const FACE_ALERT_COOLDOWN_MS = 60 * 1000; // only alert once per 60 seconds max
  const handleFaceStatusChange = useCallback(
    (faceDetected) => {
      if (!registeredChild || calmMomentActive) return;
      if (faceDetected) return;
      const now = Date.now();
      if (now - lastFaceAlertRef.current < FACE_ALERT_COOLDOWN_MS) return;
      lastFaceAlertRef.current = now;
      handleInattentive("face-api.js (no face detected)");
    },
    [registeredChild, calmMomentActive, handleInattentive],
  );

  return (
    <div style={styles.layout}>
      {calmMomentActive && (
        <CalmMomentOverlay
          onReady={() => {
            incrementCalmResumed();
            setCalmMomentActive(false);
          }}
        />
      )}
      <Navbar />
      <main style={styles.main}>
        <div style={styles.content}>
          <Outlet />
        </div>
        <aside style={styles.sidebar}>
          <section style={styles.cameraCard}>
            <h2 style={styles.sectionTitle}>Attention Monitor</h2>
            <p style={styles.helperText}>
              Camera is on for focus only. It is not recorded. If you look away,
              your grown-up may get an email.
            </p>
            <CameraMonitor onFaceStatusChange={handleFaceStatusChange} />
          </section>
          <section style={styles.cameraCard}>
            <h2 style={styles.sectionTitle}>Calm moment</h2>
            <p style={styles.helperText}>
              Tap below if you need a short pause. No timer, no rush. When
              you&apos;re ready, tap &quot;I&apos;m ready&quot; to continue.
            </p>
            <button
              type="button"
              onClick={handleCalmMomentStart}
              disabled={
                sessionStats.calmModeActivatedCount >= MAX_CALM_ACTIVATIONS
              }
              style={{
                width: "100%",
                marginTop: 12,
                padding: "14px 20px",
                fontSize: "1.05rem",
                fontWeight: 700,
                borderRadius: 16,
                border: "2px solid #87CEEB",
                background: "#E0F4FF",
                color: "#1a1a1a",
                cursor: "pointer",
                opacity:
                  sessionStats.calmModeActivatedCount >= MAX_CALM_ACTIVATIONS
                    ? 0.5
                    : 1,
              }}
              aria-label="Start calm moment"
            >
              Take a calm moment
            </button>
          </section>
        </aside>
      </main>
    </div>
  );
}
