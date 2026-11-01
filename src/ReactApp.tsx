import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Header } from './components/common/Header.js';
import { Footer } from './components/common/Footer.js';
import { NotFoundView } from './components/common/NotFoundView.js';
import { DashboardView } from './components/dashboard/DashboardView.js';
import { PeopleLocationsView } from './components/people_locations/PeopleLocationsView.js';
import { TimelineView } from './components/timeline/TimelineView.js';

import { EvidenceView } from './components/evidence/EvidenceView.js';
import { WorkspaceView } from './components/workspace/WorkspaceView.js';
import { BookmarkProvider } from './context/BookmarkContext.js';
import {
  state,
  STORAGE_KEY_NOTES,
  saveNoteForEvidence,
} from './state.js';

export const AppContent: React.FC = () => {
  const location = useLocation();
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);

  // Demo 2: Real, justified useEffect synchronizing browser document.title with route changes
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      '/dashboard': 'Case Dashboard',
      '/team/people': 'Personnel Directory',
      '/team/locations': 'Facility Locations',
      '/timeline': 'Incident Timeline',
      '/evidence': 'Evidence Catalogue',
      '/workspace': 'Investigator Workspace',
    };

    const matchedKey = Object.keys(routeTitles).find((path) =>
      location.pathname.startsWith(path)
    );
    const title = matchedKey ? routeTitles[matchedKey] : 'Investigation Portal';
    document.title = `${title} | Project ReMotion`;
  }, [location.pathname]);

  // Demo 6: Lifted notes state with downward callback
  const [notesStore, setNotesStore] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_NOTES);
      return raw ? (JSON.parse(raw) as Record<string, string>) : state.notesStore;
    } catch {
      return state.notesStore;
    }
  });

  const [selectedPersonFilter, setSelectedPersonFilter] = React.useState<string | null>(null);

  const handleSaveNote = (evidenceId: string, noteText: string) => {
    setNotesStore((prev) => {
      const next = { ...prev, [evidenceId]: noteText };
      state.notesStore = next;
      saveNoteForEvidence(evidenceId, noteText);
      return next;
    });
  };

  const handleOpenEvidence = (evidenceId: string) => {
    setSelectedEvidenceId(evidenceId);
    window.location.hash = '#/evidence';
  };

  const handleNavigateToEvidence = (personId: string) => {
    // Demo 10: Pure declarative routing with zero DOM manipulation
    setSelectedPersonFilter(personId);
    window.location.hash = '#/evidence';
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

          {/* Migrated Evidence and Workspace Views - Demo 8 Context removes prop drilling */}
          <Route
            path="/evidence"
            element={
              <EvidenceView
                initialSelectedId={selectedEvidenceId}
                initialPersonFilter={selectedPersonFilter}
                onSaveNote={handleSaveNote}
              />
            }
          />
          <Route
            path="/workspace"
            element={
              <WorkspaceView
                notesStore={notesStore}
                onOpenEvidence={handleOpenEvidence}
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
      <BookmarkProvider>
        <AppContent />
      </BookmarkProvider>
    </HashRouter>
  );
};

export default App;
