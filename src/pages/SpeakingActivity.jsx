import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { speak, playConfirmationTone } from "../utils/voice";
import { getSpeakingContentByGrade } from "../data/speakingContent";
import { getValuesSpeakingContent } from "../data/moralValuesContent";
import {
  getModuleDifficulty,
  getProgress,
  saveSessionProgress,
} from "../utils/progress";
import { unlockBadge } from "../utils/rewards";
import {
  startSpeechRecognition,
  matchSpoken,
} from "../utils/speechRecognition";

const SESSION_SIZE = 8;

const styles = {
  card: {
    borderRadius: 24,
    background: "#fff",
    padding: 32,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: 24,
  },
  title: { fontSize: "1.5rem", marginBottom: 16 },
  micButton: {
    padding: "24px 48px",
    borderRadius: 999,
    border: "none",
    background: "#3498DB",
    color: "#fff",
    fontSize: "1.3rem",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 24,
  },
  done: {
    padding: "20px 40px",
    borderRadius: 999,
    border: "none",
    background: "#3498DB",
    color: "#fff",
    fontSize: "1.25rem",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default function SpeakingActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registeredChild, startSession, endSession } = useApp();

  const difficulty =
    location.state?.difficulty || getModuleDifficulty("speaking");
  const testType = location.state?.testType || "Practice";

  const [startedAt] = useState(() => Date.now());
  const [sessionSnapshot, setSessionSnapshot] = useState(null);
  const [resultSubmitted, setResultSubmitted] = useState(false);

  const [sessionItems, setSessionItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState("idle");
  const [sessionDone, setSessionDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const level =
    registeredChild?.classType === "primary" ? "primary" : "secondary";
  const grade = registeredChild?.grade ?? 1;

  useEffect(() => {
    startSession("Speaking");

    const valuesList = getValuesSpeakingContent(level, grade, difficulty);
    const list = getSpeakingContentByGrade(level, grade);
    const byDiff = list.filter((c) => c.difficulty === difficulty);

    const source =
      valuesList.length >= SESSION_SIZE
        ? valuesList
        : byDiff.length >= SESSION_SIZE
          ? byDiff
          : list;

    const shuffled = [...source].sort(() => Math.random() - 0.5);

    setSessionItems(shuffled.slice(0, SESSION_SIZE));
    setIndex(0);
    setSessionDone(false);
    setCorrectCount(0);
    setStatus("idle");
    setResultSubmitted(false);

    return () => {
      endSession();
    };
  }, [level, grade, difficulty]);

  const current = sessionItems[index];

  useEffect(() => {
    if (!current || sessionDone) return;

    speak("Listen to the word.");

    const t = setTimeout(() => {
      speak(current.text_for_tts);
    }, 2000);

    return () => clearTimeout(t);
  }, [current, sessionDone]);

  const handleTapToSpeak = async () => {
    if (!current || status === "listening") return;

    setStatus("listening");

    speak("Now say the word.");

    const said = await startSpeechRecognition();

    const expected = current.text_for_tts.toLowerCase().trim();

    const correct = matchSpoken(expected, said);

    if (correct) {
      setCorrectCount((prev) => prev + 1);

      playConfirmationTone();

      speak("Correct!");

      setStatus("correct");
    } else {
      speak(`Correct word is ${current.text_for_tts}`);

      setStatus("wrong");
    }
  };

  const handleNext = () => {
    const nextIndex = index + 1;

    if (nextIndex >= sessionItems.length) {
      const snapshot = endSession();

      setSessionSnapshot(snapshot);

      setSessionDone(true);

      saveSessionProgress(
        "speaking",
        difficulty,
        correctCount,
        sessionItems.length,
      );

      speak("Session completed");
    } else {
      setIndex(nextIndex);

      setStatus("idle");
    }
  };

  /* ---------------- SAVE RESULT TO BACKEND ---------------- */

  useEffect(() => {
    if (!sessionDone || !sessionSnapshot || resultSubmitted) return;

    const total = sessionItems.length;
    const started = sessionSnapshot.startedAt || startedAt;
    const durationMinutes = (Date.now() - started) / 60000;
    const learnerId = `${registeredChild.childName}_${registeredChild.grade}`;

    fetch("http://localhost:4000/api/test-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learnerId,
        learnerName: registeredChild.childName,
        moduleName: "Speaking",
        testType,
        totalQuestions: total,
        correctAnswers: correctCount,
        sessionDuration: durationMinutes,
        calmModeActivatedCount: sessionSnapshot.calmModeActivatedCount || 0,
        calmModeResumedCount: sessionSnapshot.calmModeResumedCount || 0,
        inattentiveCount: sessionSnapshot.inattentiveCount || 0,
        isCompleted: true,
        sessionKey: `speaking-${learnerId}-${startedAt}`,
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log("Saved:", data))
      .catch((err) => console.error("Save error:", err));

    setResultSubmitted(true);

    const p = getProgress();
    if (!p.speaking?.sessions?.length) unlockBadge(p, "first_speaking");
  }, [
    sessionDone,
    sessionSnapshot,
    resultSubmitted,
    sessionItems.length,
    correctCount,
    registeredChild,
    startedAt,
  ]);

  if (!registeredChild) {
    return (
      <div style={styles.card}>
        <p>Please login first</p>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    );
  }

  if (sessionItems.length === 0) {
    return <div style={styles.card}>Loading...</div>;
  }

  if (sessionDone) {
    const total = sessionItems.length;

    return (
      <div style={styles.card}>
        <h2>🎉 Great Job</h2>

        <p>
          Score: {correctCount} / {total}
        </p>

        <button style={styles.done} onClick={() => navigate("/speaking")}>
          Play Again
        </button>

        <button
          style={{
            ...styles.done,
            marginLeft: 10,
            background: "#fff",
            color: "#3498DB",
            border: "2px solid #3498DB",
          }}
          onClick={() => navigate("/dashboard")}
        >
          Go Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <p>
        Question {index + 1} / {sessionItems.length}
      </p>

      <p>Correct: {correctCount}</p>

      <h2>Say the word</h2>

      <h3>{current.text_for_tts}</h3>

      <button style={styles.micButton} onClick={handleTapToSpeak}>
        Speak
      </button>

      {(status === "correct" || status === "wrong") && (
        <button
          style={{
            ...styles.micButton,
            background: "#27AE60",
          }}
          onClick={handleNext}
        >
          Next
        </button>
      )}
    </div>
  );
}
