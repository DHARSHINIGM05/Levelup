import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { speak, playConfirmationTone } from "../utils/voice";
import { getListeningContentByGrade } from "../data/listeningContent";
import { getValuesListeningContent } from "../data/moralValuesContent";
import {
  getModuleDifficulty,
  getProgress,
  saveSessionProgress,
} from "../utils/progress";
import { unlockBadge } from "../utils/rewards";

const SESSION_SIZE = 5;

const styles = {
  card: {
    borderRadius: 24,
    background: "#fff",
    padding: 32,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    marginBottom: 24,
  },
  title: { fontSize: "1.5rem", marginBottom: 16 },
  optionButton: {
    display: "block",
    width: "100%",
    maxWidth: 320,
    margin: "12px auto",
    padding: "20px 24px",
    borderRadius: 20,
    border: "2px solid #2ECC71",
    background: "#FFF7F0",
    fontSize: "1.2rem",
    fontWeight: 700,
    cursor: "pointer",
    color: "#000",
    transition: "all 0.2s",
  },
  correct: { borderColor: "#2ECC71", background: "#E8F8F0" },
  wrong: { borderColor: "#E74C3C", background: "#FDEDEC" },
  replay: {
    padding: "14px 28px",
    borderRadius: 999,
    border: "2px solid #2ECC71",
    background: "#fff",
    color: "#2ECC71",
    fontSize: "1.1rem",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: 24,
  },
  done: {
    padding: "20px 40px",
    borderRadius: 999,
    border: "none",
    background: "#2ECC71",
    color: "#fff",
    fontSize: "1.25rem",
    fontWeight: 700,
    cursor: "pointer",
  },
};

export default function ListeningActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registeredChild, startSession, endSession } = useApp();
  const testType = location.state?.testType || "Practice";

  const difficulty =
    location.state?.difficulty || getModuleDifficulty("listening");
  const [startedAt] = useState(() => Date.now());
  const [attemptedQuestions, setAttemptedQuestions] = useState(new Set());

  const [pool, setPool] = useState([]);
  const [sessionItems, setSessionItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [clickedId, setClickedId] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [canGoNext, setCanGoNext] = useState(false);
  const analyticsSentRef = useRef(false);

  const level =
    registeredChild?.classType === "primary" ? "primary" : "secondary";
  const grade = registeredChild?.grade ?? 1;

  useEffect(() => {
    const difficulty =
      location.state?.difficulty || getModuleDifficulty("listening");
    const testType = location.state?.testType || "Practice";

    startSession("Listening");
    // Values content: easy = value words, medium = value sentences, hard = moral stories (different content per level)
    const valuesList = getValuesListeningContent(level, grade, difficulty);
    const list =
      valuesList.length >= SESSION_SIZE
        ? valuesList
        : getListeningContentByGrade(level, grade, difficulty);
    const fallback = getListeningContentByGrade(level, grade);
    const source = list.length >= SESSION_SIZE ? list : fallback;
    setPool(source);
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    setSessionItems(shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length)));
    setIndex(0);
    setSessionDone(false);
    setFeedback(null);
    setCorrectCount(0);
    setCanGoNext(false);
    analyticsSentRef.current = false;
    return () => {
      endSession();
    };
  }, [level, grade, difficulty, startSession, endSession]);

  // Send analytics once when session completes; use real session snapshot
  useEffect(() => {
    if (!sessionDone || analyticsSentRef.current) return;
    analyticsSentRef.current = true;
    const sessionSnapshot = endSession();
    const total = sessionItems.length;
    const correct = correctCount;
    const started = sessionSnapshot.startedAt || startedAt;
    const durationMinutes = (Date.now() - started) / (1000 * 60);
    const learnerId = registeredChild
      ? `${registeredChild.childName || "child"}_class_${registeredChild.grade || 0}`
      : "unknown";
    if (total > 0) {
      fetch("https://levelup-jpnn.onrender.com/api/test-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          learnerId,
          learnerName: registeredChild?.childName || null,
          moduleName: "Listening",
          testType: testType,
          totalQuestions: total,
          correctAnswers: correct,
          sessionDuration: durationMinutes,
          calmModeActivatedCount: sessionSnapshot.calmModeActivatedCount ?? 0,
          calmModeResumedCount: sessionSnapshot.calmModeResumedCount ?? 0,
          inattentiveCount: sessionSnapshot.inattentiveCount ?? 0,
          isCompleted: true,
          sessionKey: `listening-${learnerId}-${startedAt}`,
        }),
      })
        .then((res) => res.json())
        .then((data) => console.log("Saved:", data))
        .catch((err) => console.error("Save error:", err));
    }
  }, [
    sessionDone,
    sessionItems.length,
    correctCount,
    startedAt,
    registeredChild,
    endSession,
  ]);

  const current = sessionItems[index];

  const speakInstruction = useCallback(() => {
    if (!current) return;
    speak(current.instruction_tts);
  }, [current]);

  const speakQuestion = useCallback(() => {
    if (!current) return;
    speak(current.text_for_tts || current.instruction_tts);
  }, [current]);

  useEffect(() => {
    if (!current || sessionDone) return;
    const t1 = setTimeout(() => {
      speak(current.instruction_tts);
      const t2 = setTimeout(
        () => speak(current.text_for_tts || current.instruction_tts),
        3000,
      );
      return () => clearTimeout(t2);
    }, 500);
    return () => clearTimeout(t1);
  }, [current?.id, sessionDone]);

  const handleOptionClick = (optionId) => {
    setClickedId(optionId);

    const correct = current.correct_id === optionId;
    const questionId = current.id;

    const isFirstAttempt = !attemptedQuestions.has(questionId);

    if (isFirstAttempt) {
      setAttemptedQuestions((prev) => new Set(prev).add(questionId));

      if (correct) {
        setCorrectCount((prev) => prev + 1);
      }
    }

    if (correct) {
      setFeedback("correct");

      playConfirmationTone();
      speak("Correct! Well done.");

      const nextIndex = index + 1;

      if (nextIndex >= sessionItems.length) {
        setSessionDone(true);
      } else {
        setCanGoNext(true);
      }
    } else {
      setFeedback("wrong");

      const correctOption = current.options.find(
        (o) => o.id === current.correct_id,
      );

      speak(`Wrong. Try again.`);

      // IMPORTANT: allow retry
      setTimeout(() => {
        setFeedback(null);
        setClickedId(null);
      }, 1500);
    }
  };

  const handleNextQuestion = () => {
    if (!canGoNext) return;
    const nextIndex = index + 1;
    if (nextIndex < sessionItems.length) {
      setIndex(nextIndex);
      setFeedback(null);
      setClickedId(null);
      setCanGoNext(false);
    }
  };

  if (!registeredChild) {
    return (
      <div style={styles.card}>
        <p>Please log in first.</p>
        <button type="button" onClick={() => navigate("/login")}>
          Go to Login
        </button>
      </div>
    );
  }

  if (pool.length === 0) {
    return (
      <div style={styles.card}>
        <p>Loading...</p>
      </div>
    );
  }

  if (sessionDone) {
    const total = sessionItems.length;
    const correct = correctCount;
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>🎉 Great job!</h2>
        <p style={{ fontSize: "1.2rem", marginBottom: 8 }}>
          You got{" "}
          <strong>
            {correct} out of {total}
          </strong>{" "}
          correct.
        </p>
        <p style={{ fontSize: "1rem", color: "#555", marginBottom: 24 }}>
          Level: {difficulty}. Progress is saved.
        </p>
        <button
          type="button"
          style={styles.done}
          onClick={() => navigate("/listening", { state: { difficulty } })}
        >
          Play again
        </button>
        <button
          type="button"
          style={{
            ...styles.done,
            background: "#fff",
            color: "#2ECC71",
            border: "2px solid #2ECC71",
            marginLeft: 12,
          }}
          onClick={() => navigate("/listening")}
        >
          Back to Listening
        </button>
      </div>
    );
  }

  if (!current) {
    return (
      <div style={styles.card}>
        <button
          type="button"
          style={styles.done}
          onClick={() => navigate("/listening")}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <p style={{ fontSize: "1rem", color: "#555", marginBottom: 8 }}>
        Question {index + 1} of {sessionItems.length} (Level: {difficulty})
      </p>
      <p style={{ fontSize: "1rem", fontWeight: 700, color: "#2ECC71" }}>
        Correct so far: {correctCount}
      </p>
      <button
        type="button"
        style={styles.replay}
        onClick={() => {
          speakInstruction();
          setTimeout(speakQuestion, 2200);
        }}
      >
        🔄 Listen again
      </button>
      <h2 style={styles.title}>
        Listen, then do the action. Click the right answer.
      </h2>
      <div>
        {current.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            style={{
              ...styles.optionButton,
              ...(feedback === "correct" && opt.id === current.correct_id
                ? styles.correct
                : null),
              ...(feedback === "wrong" && opt.id === current.correct_id
                ? styles.correct
                : null),
              ...(feedback === "wrong" &&
              opt.id === clickedId &&
              opt.id !== current.correct_id
                ? styles.wrong
                : null),
            }}
            onClick={() => handleOptionClick(opt.id)}
            disabled={feedback === "correct"}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {feedback === "correct" && !sessionDone && canGoNext && (
        <button
          type="button"
          style={{ ...styles.done, marginTop: 16 }}
          onClick={handleNextQuestion}
        >
          Next question
        </button>
      )}
      {feedback === "wrong" && (
        <p style={{ marginTop: 16, color: "#1a1a1a", fontWeight: 700 }}>
          The correct answer is:{" "}
          <strong>
            {current.options.find((o) => o.id === current.correct_id)?.label}
          </strong>
          . Try again.
        </p>
      )}
    </div>
  );
}
