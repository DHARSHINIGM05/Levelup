import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getModuleDifficulty, setModuleDifficulty } from '../utils/progress';

export default function Writing() {
  const navigate = useNavigate();
  const { registeredChild } = useApp();
  const grade = registeredChild?.grade ?? 1;
  const level = registeredChild?.classType === 'primary' ? 'Primary' : 'Secondary';
  const [difficulty, setDifficulty] = useState(() => getModuleDifficulty('writing'));

  const handleStart = () => {
    setModuleDifficulty('writing', difficulty);
    navigate('/writing/play', { state: { difficulty } });
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>✏️ Writing</h1>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: 16 }}>
        {level} Grade {grade} – Drag letters into the boxes to spell the word. Hand movement activity.
      </p>
      <p style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>Choose level:</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {['easy', 'medium', 'hard'].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDifficulty(d)}
            style={{
              padding: '12px 24px',
              borderRadius: 999,
              border: difficulty === d ? '3px solid #9B59B6' : '2px solid #ccc',
              background: difficulty === d ? '#F5EEF8' : '#fff',
              fontSize: '1.1rem',
              fontWeight: 700,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleStart}
        style={{
          padding: '20px 40px',
          borderRadius: 999,
          border: 'none',
          backgroundColor: '#9B59B6',
          color: '#fff',
          fontSize: '1.25rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(155,89,182,0.4)',
        }}
      >
        Start – Drop letters
      </button>
    </div>
  );
}
