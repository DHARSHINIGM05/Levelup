import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getModuleDifficulty, setModuleDifficulty } from '../utils/progress';

export default function Listening() {
  const navigate = useNavigate();
  const { registeredChild } = useApp();
  const grade = registeredChild?.grade ?? 1;
  const level = registeredChild?.classType === 'primary' ? 'Primary' : 'Secondary';
  const [difficulty, setDifficulty] = useState(() => getModuleDifficulty('listening'));

  const handleStart = (type) => {
    setModuleDifficulty('listening', difficulty);
  
    navigate('/listening/play', {
      state: {
        difficulty,
        testType: type   // ✅ send test type
      }
    });
  };
  

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>🎧 Listening</h1>
      <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: 16 }}>
        {level} Grade {grade} – Listen to the instruction and do the right action (click the correct answer).
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
              border: difficulty === d ? '3px solid #2ECC71' : '2px solid #ccc',
              background: difficulty === d ? '#E8F8F0' : '#fff',
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
      <button onClick={() => handleStart("Pre-test")}>
  Start Pre-test
</button>

<button onClick={() => handleStart("Practice")}>
  Start Practice
</button>

<button
  onClick={() => handleStart("Post-test")}
  style={{
    padding: '20px 40px',
    borderRadius: 999,
    border: 'none',
    backgroundColor: '#2ECC71',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(46,204,113,0.4)',
  }}
>
  Start Post-test
</button>

      
        Start – Listen and act
      
    </div>
  );
}
