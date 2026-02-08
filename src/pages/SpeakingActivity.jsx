import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { speak, playConfirmationTone } from '../utils/voice';
import { getSpeakingContentByGrade } from '../data/speakingContent';
import { getValuesSpeakingContent } from '../data/moralValuesContent';
import { getModuleDifficulty, getProgress, saveSessionProgress } from '../utils/progress';
import { unlockBadge } from '../utils/rewards';
import { startSpeechRecognition, matchSpoken } from '../utils/speechRecognition';

const SESSION_SIZE = 8;

const styles = {
  card: {
    borderRadius: 24,
    background: '#fff',
    padding: 32,
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    marginBottom: 24,
  },
  title: { fontSize: '1.5rem', marginBottom: 16 },
  micButton: {
    padding: '24px 48px',
    borderRadius: 999,
    border: 'none',
    background: '#3498DB',
    color: '#fff',
    fontSize: '1.3rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 24,
  },
  done: {
    padding: '20px 40px',
    borderRadius: 999,
    border: 'none',
    background: '#3498DB',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
  },
};

export default function SpeakingActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registeredChild } = useApp();
  const difficulty = location.state?.difficulty || getModuleDifficulty('speaking');

  const [pool, setPool] = useState([]);
  const [sessionItems, setSessionItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | listening | correct | wrong
  const [sessionDone, setSessionDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const level = registeredChild?.classType === 'primary' ? 'primary' : 'secondary';
  const grade = registeredChild?.grade ?? 1;

  useEffect(() => {
    const valuesList = getValuesSpeakingContent(level, grade, difficulty);
    const list = getSpeakingContentByGrade(level, grade);
    const byDiff = list.filter((c) => c.difficulty === difficulty);
    const source = valuesList.length >= SESSION_SIZE ? valuesList : (byDiff.length >= SESSION_SIZE ? byDiff : list);
    const shuffled = [...source].sort(() => Math.random() - 0.5);
    setSessionItems(shuffled.slice(0, Math.min(SESSION_SIZE, shuffled.length)));
    setPool(source);
    setIndex(0);
    setSessionDone(false);
    setCorrectCount(0);
    setStatus('idle');
  }, [level, grade, difficulty]);

  const current = sessionItems[index];

  useEffect(() => {
    if (!current || sessionDone) return;
    speak('Listen to the word.');
    const t = setTimeout(() => speak(current.text_for_tts), 2000);
    return () => clearTimeout(t);
  }, [current?.id, sessionDone]);

  const handleTapToSpeak = async () => {
    if (!current || status === 'listening') return;
    setStatus('listening');
    speak('Now say the word.');
    const said = await startSpeechRecognition();
    const expected = (current.text_for_tts || '').trim().toLowerCase();
    const correct = matchSpoken(expected, said);
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) {
      setCorrectCount((c) => c + 1);
      playConfirmationTone();
      speak('Correct! You said it right.');
    } else {
      speak(`The correct word is ${current.text_for_tts}. Let's try again. Say it after you hear it.`);
    }
  };

  const handleNext = () => {
    const nextIndex = index + 1;
    if (nextIndex >= sessionItems.length) {
      setSessionDone(true);
      saveSessionProgress('speaking', difficulty, correctCount, sessionItems.length);
      speak('You finished this round. Great job!');
    } else {
      setIndex(nextIndex);
      setStatus('idle');
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

  if (sessionItems.length === 0) {
    return (
      <div style={styles.card}>
        <p>Loading...</p>
      </div>
    );
  }

  if (sessionDone) {
    const total = sessionItems.length;
    const p = getProgress();
    if (!p.speaking?.sessions?.length || p.speaking.sessions.length <= 1) unlockBadge(p, 'first_speaking');
    return (
      <div style={styles.card}>
        <h2 style={styles.title}>🎉 Great job!</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: 8 }}>You got <strong>{correctCount} out of {total}</strong> correct.</p>
        <p style={{ fontSize: '1rem', color: '#555', marginBottom: 24 }}>Level: {difficulty}. Progress is saved.</p>
        <button type="button" style={styles.done} onClick={() => navigate('/speaking')}>Play again</button>
        <button type="button" style={{ ...styles.done, background: '#fff', color: '#3498DB', border: '2px solid #3498DB', marginLeft: 12 }} onClick={() => navigate('/speaking')}>Back to Speaking</button>
      </div>
    );
  }

  if (!current) {
    return (
      <div style={styles.card}>
        <button type="button" style={styles.done} onClick={() => navigate('/speaking')}>Back</button>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <p style={{ fontSize: '1rem', color: '#555' }}>Question {index + 1} of {sessionItems.length} (Level: {difficulty})</p>
      <p style={{ fontSize: '1rem', fontWeight: 700, color: '#3498DB' }}>Correct so far: {correctCount}</p>
      <h2 style={styles.title}>Hear the word, then say it out loud.</h2>
      <p style={{ fontSize: '1.2rem', marginBottom: 16 }}>Word: <strong>{current.text_for_tts}</strong></p>
      <button type="button" style={styles.micButton} onClick={handleTapToSpeak} disabled={status === 'listening'}>
        {status === 'listening' ? '🎤 Listening...' : '🎤 Tap and speak'}
      </button>
      {status === 'correct' && (
        <p style={{ color: '#2ECC71', fontWeight: 700, marginTop: 16 }}>✓ Correct!</p>
      )}
      {status === 'wrong' && (
        <p style={{ color: '#1a1a1a', fontWeight: 700, marginTop: 16 }}>
          The correct word is: <strong>{current.text_for_tts}</strong>. Try again or go to next.
        </p>
      )}
      {(status === 'correct' || status === 'wrong') && (
        <button type="button" style={{ ...styles.micButton, marginTop: 16, background: '#27AE60' }} onClick={handleNext}>
          Next word
        </button>
      )}
    </div>
  );
}
