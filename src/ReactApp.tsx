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
import { state, STORAGE_KEY_BOOKMARKS, saveBookmarksToStorage } from './state.js';

export const AppContent: React.FC = () => {
  const [selectedEvidenceId, setSelectedEvidenceId] = React.useState<string | null>(null);

  // Demo 5: Lifted bookmark state to Lowest Common Ancestor
  const [bookmarks, setBookmarks] = React.useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as string[];
      }
      return state.bookmarks;
    } catch {
      return state.bookmarks;
    }
  });

  const handleToggleBookmark = (id: string) => {
    setBookmarks((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((bId) => bId !== id) : [...prev, id];
      state.bookmarks = next;
      saveBookmarksToStorage();
      return next;
    });
  };

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
          <Route path="/dashboard" element={<DashboardView bookmarks={bookmarks} />} />

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
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
              />
            }
          />
          <Route
            path="/workspace"
            element={
              <WorkspaceView
                bookmarks={bookmarks}
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
      <AppContent />
    </HashRouter>
  );
};

export default App;
