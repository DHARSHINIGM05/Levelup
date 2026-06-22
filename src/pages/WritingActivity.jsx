import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { speak, playConfirmationTone } from '../utils/voice';
import { getWritingContentByGrade } from '../data/writingContent';
import { getValuesWritingContent } from '../data/moralValuesContent';
import { getModuleDifficulty, getProgress, saveSessionProgress } from '../utils/progress';
import { unlockBadge } from '../utils/rewards';

const SESSION_SIZE = 10;
const styles = {
  card: {
    borderRadius: 24,
    background: '#fff',
    padding: 32,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    marginBottom: 24,
  },
  title: { fontSize: '1.5rem', marginBottom: 16 },
  optionButton: {
    display: 'block',
    width: '100%',
    maxWidth: 320,
    margin: '12px auto',
    padding: '20px 24px',
    borderRadius: 20,
    border: '2px solid #9B59B6',
    background: '#F5EEF8',
    fontSize: '1.2rem',
    fontWeight: 700,
    cursor: 'pointer',
    color: '#000',
    transition: 'all 0.2s',
  },
  correct: { borderColor: '#2ECC71', background: '#E8F8F0' },
  wrong: { borderColor: '#E74C3C', background: '#FDEDEC' },
  replay: {
    padding: '14px 28px',
    borderRadius: 999,
    border: '2px solid #9B59B6',
    background: '#fff',
    color: '#9B59B6',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginBottom: 24,
  },
  done: {
    padding: '20px 40px',
    borderRadius: 999,
    border: 'none',
    background: '#9B59B6',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default function WritingActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registeredChild, startSession, endSession } = useApp();
  const difficulty = location.state?.difficulty || getModuleDifficulty('writing');
  const [startedAt] = useState(() => Date.now());
  const [pool, setPool] = useState([]);
  const [sessionItems, setSessionItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [clickedId, setClickedId] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [canGoNext, setCanGoNext] = useState(false);

  const level = registeredChild?.classType === 'primary' ? 'primary' : 'secondary';
  const grade = registeredChild?.grade ?? 1;

  useEffect(() => {
    startSession('Writing');
    const valuesList = getValuesWritingContent(level, grade, difficulty);
    const list = valuesList.length >= SESSION_SIZE ? valuesList : getWritingContentByGrade(level, grade);
    setPool(list);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setSessionItems(shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length)));
    setIndex(0);
    setSessionDone(false);
    setFeedback(null);
    return () => {
      endSession();
    };
  }, [level, grade, difficulty, startSession, endSession]);

  const current = sessionItems[index];

  useEffect(() => {
    if (!current || sessionDone) return;
    speak(current.instruction_tts);
    const t = setTimeout(() => speak(current.text_for_tts), 2500);
    return () => clearTimeout(t);
  }, [current?.id, sessionDone]);

  const handleOptionClick = (optionId) => {
    if (feedback !== null) return;
    setClickedId(optionId);
    const correct = current.correct_id === optionId;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setCorrectCount((c) => c + 1);
      playConfirmationTone();
      speak('Correct! Well done.');
      const nextIndex = index + 1;
      if (nextIndex >= sessionItems.length) {
        setSessionDone(true);
        saveSessionProgress('writing', 'easy', correctCount + 1, sessionItems.length);
        const p = getProgress();
        if (!p.writing?.sessions?.length || p.writing.sessions.length <= 1) unlockBadge(p, 'first_writing');
        setTimeout(() => speak('You finished this round. Great job!'), 1500);
      } else {
        // For autistic children, do not auto-advance.
        // Show a clear Next Question button so they can move on when ready.
        setCanGoNext(true);
      }
    } else {
      const correctOption = current.options.find((o) => o.id === current.correct_id);
      const correctLabel = correctOption ? correctOption.label : current.text_for_tts;
      speak(`The correct spelling is ${correctLabel}. Let's try again.`);
      setTimeout(() => { setFeedback(null); setClickedId(null); }, 3500);
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
        <button type="button" onClick={() => navigate('/login')}>Go to Login</button>
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
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>🎉 Great job!</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: 24 }}>You got {correctCount} out of {sessionItems.length} correct. Progress saved.</p>
        {(() => {
          const total = sessionItems.length;
          const sessionSnapshot = endSession();
          const started = sessionSnapshot.startedAt || startedAt;
          const durationMinutes = (Date.now() - started) / (1000 * 60);
          const learnerId = registeredChild
            ? `${registeredChild.childName || 'child'}_class_${registeredChild.grade || 0}`
            : 'unknown';
          if (total > 0) {
            fetch('http://localhost:4000/api/test-result', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                learnerId,
                learnerName: registeredChild?.childName || null,
                moduleName: 'Writing',
                testType: 'Practice',
                totalQuestions: total,
                correctAnswers: correctCount,
                sessionDuration: durationMinutes,
              calmModeActivatedCount: sessionSnapshot.calmModeActivatedCount || 0,
              calmModeResumedCount: sessionSnapshot.calmModeResumedCount || 0,
              inattentiveCount: sessionSnapshot.inattentiveCount || 0,
                isCompleted: true,
                sessionKey: `writing-${learnerId}-${startedAt}`,
              }),
            }).catch(() => {});
          }
          return null;
        })()}
        <button type="button" style={styles.done} onClick={() => {
          setSessionDone(false);
          setIndex(0);
          const shuffled = [...pool].sort(() => Math.random() - 0.5);
          setSessionItems(shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length)));
          setFeedback(null);
        }}>Play again</button>
        <button type="button" style={{ ...styles.done, background: '#fff', color: '#9B59B6', border: '2px solid #9B59B6', marginLeft: 12 }} onClick={() => navigate('/writing')}>Back to Writing</button>
      </div>
    );
  }

  if (!current) {
    return (
      <div style={styles.card}>
        <button type="button" style={styles.done} onClick={() => navigate('/writing')}>Back</button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <p style={{ fontSize: '1rem', color: '#555', marginBottom: 16 }}>Question {index + 1} of {sessionItems.length}</p>
      <button type="button" style={styles.replay} onClick={() => { speak(current.instruction_tts); setTimeout(() => speak(current.text_for_tts), 2200); }}>🔄 Hear word again</button>
      <h2 style={styles.title}>Listen to the word. Click the correct spelling.</h2>
      <div>
        {current.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            style={{
              ...styles.optionButton,
              ...(feedback === 'correct' && opt.id === current.correct_id ? styles.correct : null),
              ...(feedback === 'wrong' && opt.id === current.correct_id ? styles.correct : null),
              ...(feedback === 'wrong' && opt.id === clickedId && opt.id !== current.correct_id ? styles.wrong : null),
            }}
            onClick={() => handleOptionClick(opt.id)}
            disabled={feedback !== null}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {feedback === 'wrong' && (
        <p style={{ marginTop: 16, color: '#1a1a1a', fontWeight: 700 }}>
          The correct spelling is: <strong>{current.options.find((o) => o.id === current.correct_id)?.label}</strong>. Try again.
        </p>
      )}
      {feedback === 'correct' && !sessionDone && canGoNext && (
        <button
          type="button"
          style={{ ...styles.done, marginTop: 16 }}
          onClick={handleNextQuestion}
        >
          Next question
        </button>
      )}
    </div>
  );
}
