



import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { speak, playConfirmationTone } from '../utils/voice';
import {
  getReadingPuzzleByGrade,
  getReadingPuzzleByGradeAny
} from '../data/readingPuzzleContent';
import { getValuesReadingPuzzles } from '../data/moralValuesContent';
import {
  getModuleDifficulty,
  getProgress,
  saveSessionProgress
} from '../utils/progress';
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

  const { registeredChild, startSession, endSession } = useApp();

  const difficulty =
    location.state?.difficulty || getModuleDifficulty('reading');

  const [startedAt] = useState(() => Date.now());

  const [sessionItems, setSessionItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [slots, setSlots] = useState([]);
  const [tiles, setTiles] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [sessionDone, setSessionDone] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const [sessionSnapshot, setSessionSnapshot] = useState(null);

  const level =
    registeredChild?.classType === 'primary'
      ? 'primary'
      : 'secondary';

  const grade = registeredChild?.grade ?? 1;

  /* ---------------- START SESSION ---------------- */

  useEffect(() => {

    startSession('Reading');

    const valuesList =
      getValuesReadingPuzzles(level, grade, difficulty);

    let list =
      valuesList.length >= SESSION_SIZE
        ? valuesList
        : getReadingPuzzleByGrade(level, grade, difficulty);

    if (list.length < SESSION_SIZE) {
      list = getReadingPuzzleByGradeAny(level, grade);
    }

    const shuffled =
      [...list]
        .sort(() => Math.random() - 0.5)
        .slice(0, SESSION_SIZE);

    setSessionItems(shuffled);
    setIndex(0);
    setSessionDone(false);
    setCorrectCount(0);
    setFeedback(null);

  }, [level, grade, difficulty, startSession]);


  /* ---------------- END SESSION SAFELY ---------------- */

  useEffect(() => {

    if (sessionDone) {

      const snapshot = endSession();

      setSessionSnapshot(snapshot);

    }

  }, [sessionDone, endSession]);


  const current = sessionItems[index];


  /* ---------------- LOAD PUZZLE ---------------- */

  useEffect(() => {

    if (!current) return;

    const shuffled =
      [...current.words]
        .sort(() => Math.random() - 0.5);

    setTiles(shuffled);

    setSlots(current.words.map(() => null));

    setFeedback(null);

  }, [current?.id]);


  /* ---------------- VOICE PROMPT ---------------- */

  useEffect(() => {

    if (!current || sessionDone) return;

    speak('Put the words in order to make the sentence.');

  }, [current?.id, sessionDone]);


  /* ---------------- DRAG FUNCTIONS ---------------- */

  const handleDragStart = (e, word, isSlot, slotIndex) => {

    e.dataTransfer.setData(
      'text/plain',
      JSON.stringify({ word, isSlot, slotIndex })
    );

  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetSlotIndex) => {

    e.preventDefault();

    try {

      const data =
        JSON.parse(e.dataTransfer.getData('text/plain'));

      const { word, isSlot, slotIndex } = data;

      if (isSlot) {

        const currentWord = slots[slotIndex];

        const newSlots = [...slots];

        newSlots[slotIndex] = null;

        newSlots[targetSlotIndex] = currentWord;

        setSlots(newSlots);

        if (currentWord)
          setTiles(t => [...t, currentWord]);

      }

      else {

        const newSlots = [...slots];

        newSlots[targetSlotIndex] = word;

        setSlots(newSlots);

        setTiles(t =>
          t.filter(w => w !== word)
        );

      }

    }
    catch {}

  };


  const handleDropOnTile = (e) => {

    e.preventDefault();

    try {

      const data =
        JSON.parse(e.dataTransfer.getData('text/plain'));

      const { isSlot, slotIndex } = data;

      if (isSlot && slots[slotIndex]) {

        const newSlots = [...slots];

        newSlots[slotIndex] = null;

        setSlots(newSlots);

        setTiles(t =>
          [...t, slots[slotIndex]]
        );

      }

    }
    catch {}

  };


  /* ---------------- CHECK ANSWER ---------------- */

  const checkAnswer = () => {

    const answer =
      slots.join(' ').trim();

    const correct =
      answer === current.correctOrder;

    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {

      setCorrectCount(c => c + 1);

      playConfirmationTone();

      speak('Correct! Well done.');

    }

    else {

      speak(
        `The correct sentence is: ${current.correctOrder}`
      );

    }

  };


  /* ---------------- NEXT PUZZLE ---------------- */

  const nextPuzzle = () => {

    if (index + 1 >= sessionItems.length) {

      setSessionDone(true);

      saveSessionProgress(
        'reading',
        difficulty,
        correctCount + (feedback === 'correct' ? 1 : 0),
        sessionItems.length
      );

      speak('You finished this round.');

    }

    else {

      setIndex(i => i + 1);

      setFeedback(null);

    }

  };


  /* ---------------- LOGIN CHECK ---------------- */

  if (!registeredChild) {

    return (
      <div style={{ padding: 32 }}>
        <p>Please log in first.</p>

        <button
          onClick={() => navigate('/login')}
        >
          Login
        </button>
      </div>
    );

  }


  /* ---------------- LOADING ---------------- */

  if (sessionItems.length === 0) {

    return <div>Loading...</div>;

  }


  /* ---------------- SESSION COMPLETE ---------------- */

  if (sessionDone) {

    const total = sessionItems.length;

    const correct = correctCount;

    const p = getProgress();

    if (
      !p.reading?.sessions?.length ||
      p.reading.sessions.length <= 1
    ) {
      unlockBadge(p, 'first_reading');
    }

    const started =
      sessionSnapshot?.startedAt || startedAt;

    const durationMinutes =
      (Date.now() - started) / 60000;

    const learnerId =
      `${registeredChild.childName}_class_${registeredChild.grade}`;

    /* Save result */
    fetch(
      'http://localhost:4000/api/test-result',
      {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json'
        },

        body: JSON.stringify({

          learnerId,

          learnerName:
            registeredChild.childName,

          moduleName: 'Reading',

          testType: 'Practice',

          totalQuestions: total,

          correctAnswers: correct,

          sessionDuration: durationMinutes,

          calmModeActivatedCount:
            sessionSnapshot?.calmModeActivatedCount || 0,

          calmModeResumedCount:
            sessionSnapshot?.calmModeResumedCount || 0,

          inattentiveCount:
            sessionSnapshot?.inattentiveCount || 0,

          isCompleted: true,

          sessionKey:
            `reading-${learnerId}-${startedAt}`

        }),

      }
    ).catch(() => {});


    return (

      <div style={{ padding: 32 }}>

        <h2>🎉 Great Job!</h2>

        <p>
          {correct} out of {total} correct
        </p>

        <button
          onClick={() =>
            navigate('/reading', { replace: true })
          }
        >
          Back to Reading
        </button>

      </div>

    );

  }


  /* ---------------- MAIN UI ---------------- */

  return (

    <div style={{ padding: 32 }}>

      <p>
        Puzzle {index + 1} of {sessionItems.length}
      </p>

      <div>

        {slots.map((word, i) => (

          <span
            key={i}
            style={boxStyle}
            onDragOver={handleDragOver}
            onDrop={e =>
              handleDrop(e, i)
            }
          >

            {word || '—'}

          </span>

        ))}

      </div>


      <div>

        {tiles.map((word, i) => (

          <span
            key={i}
            draggable
            style={tileStyle}
            onDragStart={e =>
              handleDragStart(e, word, false)
            }
            onDragOver={handleDragOver}
            onDrop={handleDropOnTile}
          >

            {word}

          </span>

        ))}

      </div>


      {feedback === 'correct' &&
        <p style={{ color: 'green' }}>
          Correct!
        </p>
      }

      {feedback === 'wrong' &&
        <p>
          Correct sentence:
          {current.correctOrder}
        </p>
      }


      <button onClick={checkAnswer}>
        Check
      </button>

      {(feedback === 'correct' ||
        feedback === 'wrong') && (

        <button onClick={nextPuzzle}>
          Next
        </button>

      )}

    </div>

  );

}