import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StubView } from './components/StubView';
import { NotFoundView } from './components/NotFoundView';
import { DashboardView } from './components/dashboard/DashboardView';
import { ViewKey } from './types/navigation';

function extractViewFromHash(hash: string): { isReact: boolean; view: string } {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean || clean === 'react' || clean === 'react/') {
    return { isReact: true, view: 'dashboard' };
  }
  if (clean.startsWith('react/')) {
    const subRoute = clean.replace(/^react\//, '').trim();
    return { isReact: true, view: subRoute || 'dashboard' };
  }
  return { isReact: false, view: clean };
}

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>(() => {
    return extractViewFromHash(window.location.hash).view;
  });

  const syncHashToView = useCallback(() => {
    const { isReact, view } = extractViewFromHash(window.location.hash);
    if (isReact) {
      setCurrentView(view);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('hashchange', syncHashToView);
    return () => {
      window.removeEventListener('hashchange', syncHashToView);
    };
  }, [syncHashToView]);

  const navigateToView = (view: ViewKey | string) => {
    window.location.hash = `react/${view}`;
  };

  const handleSwitchToVanilla = () => {
    window.location.hash = 'dashboard';
  };

  const handleOpenInVanilla = (view: string) => {
    window.location.hash = view;
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={navigateToView} />;
      case 'evidence':
        return (
          <StubView
            viewId="evidence"
            title="Evidence Locker"
            icon=""
            description="Examine logs, telemetry files, sensor readings, and incident reports."
            onOpenInVanilla={handleOpenInVanilla}
          />
        );
      case 'people':
        return (
          <StubView
            viewId="people"
            title="People & Locations"
            icon=""
            description="Review clinical personnel profiles, engineering team logs, and facility floorplans."
            onOpenInVanilla={handleOpenInVanilla}
          />
        );
      case 'timeline':
        return (
          <StubView
            viewId="timeline"
            title="Investigation Timeline"
            icon=""
            description="Chronological reconstruction of events leading up to the robot malfunction."
            onOpenInVanilla={handleOpenInVanilla}
          />
        );
      case 'workspace':
        return (
          <StubView
            viewId="workspace"
            title="Investigator Workspace"
            icon=""
            description="Private notes, hypotheses tracking, and correlation matrix workspace."
            onOpenInVanilla={handleOpenInVanilla}
          />
        );
      default:
        return (
          <NotFoundView
            attemptedRoute={`#react/${currentView}`}
            onNavigateHome={() => navigateToView('dashboard')}
          />
        );
    }
  };

  return (
    <div className="react-application-shell">
      <Header
        currentView={currentView}
        onNavigate={navigateToView}
        onSwitchToVanilla={handleSwitchToVanilla}
      />
      <main className="app-main">{renderContent()}</main>
      <Footer />
    </div>
  );
};

export default App;
