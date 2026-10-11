import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../types/navigation.js';

interface HeaderProps {
  onSwitchToVanilla?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSwitchToVanilla }) => {
  const location = useLocation();

  const isItemActive = (path: string) => {
    if (path.startsWith('/team')) {
      return location.pathname.startsWith('/team');
    }
    return location.pathname === path;
  };

  const handleSwitchToVanilla = () => {
    if (onSwitchToVanilla) {
      onSwitchToVanilla();
    } else {
      window.location.hash = 'dashboard';
    }
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <Link
          to="/dashboard"
          className="brand"
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
        >
          <img src="./assets/logo/logo.svg" alt="Project ReMotion logo" className="brand-logo" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1>Project ReMotion</h1>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  background: 'rgba(47, 111, 237, 0.35)',
                  border: '1px solid var(--color-accent)',
                  color: '#93c5fd',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                React Shell
              </span>
            </div>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </Link>

        <nav className="main-nav" aria-label="React Main Navigation">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item.path);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={`nav-btn ${active ? 'active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </NavLink>
            );
          })}

          <button
            type="button"
            className="nav-btn"
            onClick={handleSwitchToVanilla}
            title="Switch to the legacy Vanilla JS application"
            style={{
              borderColor: 'rgba(255, 255, 255, 0.4)',
              color: '#d1d5db',
              fontSize: '0.8rem',
              marginLeft: '4px',
            }}
          >
            &larr; Vanilla App
          </button>
        </nav>
      </div>
    </header>
  );
};
