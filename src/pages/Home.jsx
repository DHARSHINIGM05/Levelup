import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getProgress } from '../utils/progress';
import { getBadgeList, getRandomQuote } from '../utils/rewards';
import Counter from '../components/Counter';
const MODULE_COLORS = {
  listening: { bg: '#1e8449', hover: '#27AE60' },
  speaking: { bg: '#1a5276', hover: '#2980B9' },
  reading: { bg: '#b45f06', hover: '#D35400' },
  writing: { bg: '#6c3483', hover: '#8E44AD' },
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: 24,
};

export default function Home() {
  const navigate = useNavigate();
  const { registeredChild } = useApp();
  const progress = getProgress();
  const badges = getBadgeList(progress);
  const quote = getRandomQuote();

  const modules = [
    { path: '/listening', label: 'Listening', emoji: '🎧', key: 'listening' },
    { path: '/speaking', label: 'Speaking', emoji: '🗣️', key: 'speaking' },
    { path: '/reading', label: 'Reading', emoji: '📖', key: 'reading' },
    { path: '/writing', label: 'Writing', emoji: '✏️', key: 'writing' },
  ];

  return (
    <div>
      <h1 style={{ fontSize: '2rem', marginBottom: 8, color: '#1a1a1a', fontWeight: 800 }}>Level Up Learning</h1>

    <Counter/>
      {registeredChild && (
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: 16, fontWeight: 700 }}>
          Hello {registeredChild.childName}! Choose a game to play.
        </p>
      )}

      {badges.length > 0 && (
        <section style={{ marginBottom: 24, padding: '12px 16px', background: '#fff', borderRadius: 16, border: '2px solid #1e8449' }}>
          <p style={{ fontSize: '1rem', color: '#1a1a1a', fontWeight: 700, marginBottom: 8 }}>Your badges</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {badges.map((b) => (
              <span key={b.id} style={{ padding: '6px 12px', background: '#E8F8F0', borderRadius: 999, fontSize: '0.95rem', fontWeight: 700 }}>
                {b.emoji} {b.label}
              </span>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 16 }}>
        <p style={{ fontSize: '1rem', color: '#333', fontWeight: 700, marginBottom: 4 }}>Last scores (progress)</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          {modules.map((m) => {
            const p = progress[m.key];
            const text = p?.lastScore != null ? `${m.label}: ${p.lastScore}/${p.lastTotal || 10}` : `${m.label}: —`;
            return (
              <span key={m.key} style={{ padding: '6px 12px', background: '#f0f0f0', borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, color: '#1a1a1a' }}>
                {text}
              </span>
            );
          })}
        </div>
      </section>

      <p style={{ fontSize: '1rem', fontStyle: 'italic', color: '#444', marginBottom: 24 }}>"{quote}"</p>

      <div style={gridStyle}>
        {modules.map((m) => {
          const colors = MODULE_COLORS[m.key];
          return (
            <button
              key={m.path}
              type="button"
              style={{
                padding: '32px 24px',
                borderRadius: 24,
                background: colors.bg,
                color: '#fff',
                border: 'none',
                boxShadow: `0 10px 30px ${colors.bg}99`,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                textAlign: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
              }}
              onClick={() => navigate(m.path)}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 14px 40px ${colors.bg}99`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = `0 10px 30px ${colors.bg}66`;
              }}
            >
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: 12 }}>{m.emoji}</span>
              {m.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
