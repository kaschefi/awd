import React from 'react';
import { NAV_ITEMS, ViewKey } from '../types/navigation';

interface HeaderProps {
  currentView: string;
  onNavigate: (viewId: ViewKey) => void;
  onSwitchToVanilla: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onSwitchToVanilla }) => {
  return (
    <header className="app-header">
      <div className="header-inner">
        <div
          className="brand"
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate('dashboard')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onNavigate('dashboard');
          }}
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
                React Shell (Demo 9)
              </span>
            </div>
            <p className="subtitle">
              Investigate the failure of an AI-assisted rehabilitation robot.
            </p>
          </div>
        </div>

        <nav className="main-nav" aria-label="React Main Navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={() => onNavigate(item.id)}
              >
                {item.label}
              </button>
            );
          })}

          <button
            type="button"
            className="nav-btn"
            onClick={onSwitchToVanilla}
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
