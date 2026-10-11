import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { StubView } from './components/common/StubView.js';
import { NotFoundView } from './components/common/NotFoundView.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { PeopleLocationsView } from './components/people_locations/PeopleLocationsView.js';
import { TimelineView } from './components/timeline/TimelineView.js';

export const AppContent: React.FC = () => {
  const handleOpenInVanilla = (view: string) => {
    window.location.hash = view;
  };

  const handleNavigateToEvidence = (personId: string) => {
    window.location.hash = 'evidence';
    setTimeout(() => {
      const filterEl = document.getElementById('filterPerson') as HTMLSelectElement | null;
      if (filterEl) {
        filterEl.value = personId;
        filterEl.dispatchEvent(new Event('change'));
      }
    }, 50);
  };

  return (
    <div className="react-application-shell">
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardView />} />

          {/* People & Locations real routes */}
          <Route path="/team" element={<Navigate to="/team/people" replace />} />
          <Route
            path="/team/*"
            element={<PeopleLocationsView onNavigateToEvidence={handleNavigateToEvidence} />}
          />

          {/* Legacy route compatibility */}
          <Route path="/people" element={<Navigate to="/team/people" replace />} />
          <Route path="/locations" element={<Navigate to="/team/locations" replace />} />

          {/* Timeline route */}
          <Route path="/timeline" element={<TimelineView />} />

          {/* Unmigrated Views (Exercise 5 stubs) */}
          <Route
            path="/evidence"
            element={
              <StubView
                viewId="evidence"
                title="Evidence Locker"
                icon=""
                description="Examine logs, telemetry files, sensor readings, and incident reports."
                onOpenInVanilla={handleOpenInVanilla}
              />
            }
          />
          <Route
            path="/workspace"
            element={
              <StubView
                viewId="workspace"
                title="Investigator Workspace"
                icon=""
                description="Private notes, hypotheses tracking, and correlation matrix workspace."
                onOpenInVanilla={handleOpenInVanilla}
              />
            }
          />

          {/* Wildcard 404 Catch-All */}
          <Route path="*" element={<NotFoundView />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <HashRouter basename="/react">
      <AppContent />
    </HashRouter>
  );
};

export default App;
