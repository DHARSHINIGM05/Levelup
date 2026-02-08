import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getModuleDifficulty, setModuleDifficulty } from '../utils/progress';
import { isSpeechRecognitionSupported } from '../utils/speechRecognition';

export default function Speaking() {
  const navigate = useNavigate();
  const { registeredChild } = useApp();
  const grade = registeredChild?.grade ?? 1;
  const level = registeredChild?.classType === 'primary' ? 'Primary' : 'Secondary';
  const [difficulty, setDifficulty] = useState(() => getModuleDifficulty('speaking'));
  const supported = isSpeechRecognitionSupported();

  const handleStart = () => {
    setModuleDifficulty('speaking', difficulty);
    navigate('/speaking/play', { state: { difficulty } });
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>🗣️ Speaking</h1>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: 16 }}>
        {level} Grade {grade} – Hear the word, then say it out loud. The app will listen to you.
      </p>
      {!supported && (
        <p style={{ color: '#E67E22', marginBottom: 16, fontWeight: 700 }}>
          Your browser may not support voice input. Try Chrome or Edge for best results.
        </p>
      )}
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
              border: difficulty === d ? '3px solid #3498DB' : '2px solid #ccc',
              background: difficulty === d ? '#EBF5FB' : '#fff',
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
          backgroundColor: '#3498DB',
          color: '#fff',
          fontSize: '1.25rem',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 24px rgba(52,152,219,0.4)',
        }}
      >
        Start – Hear and speak
      </button>
    </div>
  );
}
