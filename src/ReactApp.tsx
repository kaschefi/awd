import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { NotFoundView } from './components/common/NotFoundView.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { PeopleLocationsView } from './components/people_locations/PeopleLocationsView.js';
import { TimelineView } from './components/timeline/TimelineView.js';

import { EvidenceView } from './components/evidence/EvidenceView.js';
import { WorkspaceView } from './components/workspace/WorkspaceView.js';

export const AppContent: React.FC = () => {
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  const handleOpenEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    window.location.hash = '#/evidence';
  };

  const handleNavigateToEvidence = (personId: string) => {
    window.location.hash = '#/evidence';
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

          {/* Migrated Evidence and Workspace Views */}
          <Route
            path="/evidence"
            element={
              <EvidenceView
                initialSelectedId={selectedEvidenceId}
              />
            }
          />
          <Route
            path="/workspace"
            element={<WorkspaceView onOpenEvidence={handleOpenEvidence} />}
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
