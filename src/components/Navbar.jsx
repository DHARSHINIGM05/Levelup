import React from 'react';
import { NavLink } from 'react-router-dom';

const MODULE_COLORS = {
  home: '#27AE60',
  listening: '#2ECC71',
  speaking: '#3498DB',
  reading: '#E67E22',
  writing: '#9B59B6',
};

const navStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  padding: '16px 24px',
  background: 'linear-gradient(135deg, #34495E, #2C3E50)',
  borderRadius: '0 0 20px 20px',
  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
  justifyContent: 'center',
  alignItems: 'center',
};

function NavLinkStyled({ to, label, color }) {
  return (
    <NavLink
      to={to}
      style={({ isActive }) => ({
        padding: '14px 22px',
        borderRadius: 999,
        textDecoration: 'none',
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.05rem',
        background: isActive ? color : 'rgba(255,255,255,0.15)',
        border: isActive ? `2px solid ${color}` : '2px solid transparent',
        transition: 'background 0.2s, transform 0.1s',
      })}
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  return (
    <nav style={navStyle} aria-label="Main navigation">
      <NavLinkStyled to="/home" label="Home" color={MODULE_COLORS.home} />
      <NavLinkStyled to="/listening" label="Listening" color={MODULE_COLORS.listening} />
      <NavLinkStyled to="/speaking" label="Speaking" color={MODULE_COLORS.speaking} />
      <NavLinkStyled to="/reading" label="Reading" color={MODULE_COLORS.reading} />
      <NavLinkStyled to="/writing" label="Writing" color={MODULE_COLORS.writing} />
    </nav>
  );
}
