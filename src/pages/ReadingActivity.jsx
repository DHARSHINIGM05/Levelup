import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { speak, playConfirmationTone } from '../utils/voice';
import { getReadingPuzzleByGrade, getReadingPuzzleByGradeAny } from '../data/readingPuzzleContent';
import { getValuesReadingPuzzles } from '../data/moralValuesContent';
import { getModuleDifficulty, getProgress, saveSessionProgress } from '../utils/progress';
import { unlockBadge } from '../utils/rewards';

const SESSION_SIZE = 6;

const boxStyle = {
  padding: '16px 24px',
  margin: 8,
  borderRadius: 16,
  border: '2px dashed #E67E22',
  background: '#FEF5E7',
  minWidth: 80,
  minHeight: 24,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.2rem',
  fontWeight: 700,
};
const tileStyle = {
  padding: '16px 24px',
  margin: 8,
  borderRadius: 16,
  border: '2px solid #E67E22',
  background: '#fff',
  cursor: 'grab',
  fontSize: '1.2rem',
  fontWeight: 700,
  userSelect: 'none',
};

export default function ReadingActivity() {
  const navigate = useNavigate();
  const location = useLocation();
  const { registeredChild } = useApp();
  const difficulty = location.state?.difficulty || getModuleDifficulty('reading');

  const [sessionItems, setSessionItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [draggedTile, setDraggedTile] = useState(null);
  const [draggedSlotIndex, setDraggedSlotIndex] = useState(null);

  const level = registeredChild?.classType === 'primary' ? 'primary' : 'secondary';
  const grade = registeredChild?.grade ?? 1;

  useEffect(() => {
    const valuesList = getValuesReadingPuzzles(level, grade, difficulty);
    let list = valuesList.length >= SESSION_SIZE ? valuesList : getReadingPuzzleByGrade(level, grade, difficulty);
    if (list.length < SESSION_SIZE) list = getReadingPuzzleByGradeAny(level, grade);
    const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, SESSION_SIZE);
    setSessionItems(shuffled);
    setIndex(0);
    setSessionDone(false);
    setCorrectCount(0);
    setFeedback(null);
  }, [level, grade, difficulty]);

  const current = sessionItems[index];

  useEffect(() => {
    if (!current) return;
    const shuffled = [...current.words].sort(() => Math.random() - 0.5);
    setTiles(shuffled);
    setSlots(current.words.map(() => null));
    setFeedback(null);
  }, [current?.id]);

  useEffect(() => {
    if (!current || sessionDone) return;
    speak('Put the words in order to make the sentence.');
  }, [current?.id, sessionDone]);

  const handleDragStart = (e, word, isSlot, slotIndex) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ word, isSlot, slotIndex }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTile(isSlot ? null : word);
    setDraggedSlotIndex(isSlot ? slotIndex : null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSlotIndex) => {
    e.preventDefault();
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      const { word, isSlot, slotIndex } = data;
      if (isSlot) {
        const currentWord = slots[slotIndex];
        const newSlots = [...slots];
        newSlots[slotIndex] = null;
        newSlots[targetSlotIndex] = currentWord;
        setSlots(newSlots);
        if (currentWord) setTiles((t) => [...t, currentWord].filter(Boolean));
      } else {
        const newSlots = [...slots];
        newSlots[targetSlotIndex] = word;
        setSlots(newSlots);
        setTiles((t) => t.filter((w) => w !== word));
      }
    } catch (_) {}
    setDraggedTile(null);
    setDraggedSlotIndex(null);
  };

  const handleDropOnTile = (e, word) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    try {
      const { word: w, isSlot, slotIndex } = JSON.parse(data);
      if (isSlot && slots[slotIndex]) {
        const newSlots = [...slots];
        newSlots[slotIndex] = null;
        setSlots(newSlots);
        setTiles((t) => [...t, slots[slotIndex]]);
      }
    } catch (_) {}
    setDraggedTile(null);
    setDraggedSlotIndex(null);
  };

  const checkAnswer = () => {
    const answer = slots.join(' ').trim();
    const correct = answer === current.correctOrder;
    setFeedback(correct ? 'correct' : 'wrong');
    if (correct) {
      setCorrectCount((c) => c + 1);
      playConfirmationTone();
      speak('Correct! Well done.');
    } else {
      speak(`The correct sentence is: ${current.correctOrder}. Let's try again.`);
    }
  };

  const nextPuzzle = () => {
    if (index + 1 >= sessionItems.length) {
      setSessionDone(true);
      saveSessionProgress('reading', difficulty, correctCount + (feedback === 'correct' ? 1 : 0), sessionItems.length);
      speak('You finished this round. Great job!');
    } else {
      setIndex((i) => i + 1);
      setFeedback(null);
    }
  };

  if (!registeredChild) {
    return (
      <div style={{ padding: 32, background: '#fff', borderRadius: 24 }}>
        <p>Please log in first.</p>
        <button type="button" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  if (sessionItems.length === 0) {
    return (
      <div style={{ padding: 32, background: '#fff', borderRadius: 24 }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (sessionDone) {
    const total = sessionItems.length;
    const correct = correctCount;
    const p = getProgress();
    if (!p.reading?.sessions?.length || p.reading.sessions.length <= 1) unlockBadge(p, 'first_reading');
    return (
      <div style={{ padding: 32, background: '#fff', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
        <h2 style={{ fontSize: '1.5rem' }}>🎉 Great job!</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: 24 }}>You got <strong>{correct} out of {total}</strong> correct. Progress saved.</p>
        <button type="button" style={{ padding: '16px 32px', borderRadius: 999, border: 'none', background: '#E67E22', color: '#fff', fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/reading')}>Back to Reading</button>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div style={{ padding: 32, background: '#fff', borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}>
      <p style={{ color: '#555' }}>Puzzle {index + 1} of {sessionItems.length} (Level: {difficulty}) – Correct: {correctCount}</p>
      <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Drag the words into the boxes to make the sentence.</h2>
      <div style={{ marginBottom: 24, minHeight: 60 }}>
        {current.words.map((_, i) => (
          <span
            key={i}
            style={boxStyle}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, i)}
          >
            {slots[i] || ' — '}
          </span>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        {tiles.map((word, i) => (
          <span
            key={`${word}-${i}`}
            draggable
            onDragStart={(e) => handleDragStart(e, word, false)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnTile(e, word)}
            style={tileStyle}
          >
            {word}
          </span>
        ))}
      </div>
      {feedback === 'correct' && <p style={{ color: '#2ECC71', fontWeight: 700 }}>✓ Correct!</p>}
      {feedback === 'wrong' && (
        <p style={{ color: '#1a1a1a', fontWeight: 700 }}>Correct sentence: <strong>{current.correctOrder}</strong>. Try again.</p>
      )}
      <button type="button" style={{ ...boxStyle, border: '2px solid #E67E22', cursor: 'pointer', marginRight: 8 }} onClick={checkAnswer}>Check</button>
      {(feedback === 'correct' || feedback === 'wrong') && (
        <button type="button" style={{ ...boxStyle, border: '2px solid #27AE60', background: '#E8F8F0', cursor: 'pointer' }} onClick={nextPuzzle}>Next</button>
      )}
    </div>
  );
}
