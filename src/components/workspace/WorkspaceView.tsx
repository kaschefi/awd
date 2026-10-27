import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalData } from '../../hooks/usePortalData.js';
import { BookmarkedEvidenceList } from './BookmarkedEvidenceList.js';
import { NotesList } from './NotesList.js';
import { HypothesisForm } from './HypothesisForm.js';
import { state, loadNotesFromStorage } from '../../state.js';

export interface WorkspaceViewProps {
  bookmarks?: string[];
  notesStore?: Record<string, string>;
  onOpenEvidence?: (evidenceId: string) => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  bookmarks: propBookmarks,
  notesStore: propNotesStore,
  onOpenEvidence,
}) => {
  const navigate = useNavigate();
  const { evidence, people, bookmarks: portalBookmarks } = usePortalData();
  const bookmarks = propBookmarks ?? portalBookmarks;
  const [localNotes, setLocalNotes] = useState<Record<string, string>>(() => ({ ...state.notesStore }));
  const notes = propNotesStore ?? localNotes;

  useEffect(() => {
    loadNotesFromStorage();
    setLocalNotes({ ...state.notesStore });
  }, []);

  const handleOpenEvidence = (evidenceId: string) => {
    if (onOpenEvidence) {
      onOpenEvidence(evidenceId);
    } else {
      navigate('/evidence');
    }
  };

  return (
    <section id="view-workspace" className="view active">
      <h2>Investigator Workspace</h2>

      <div className="workspace-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="workspace-col card">
          <h3>Bookmarked Evidence</h3>
          <BookmarkedEvidenceList
            evidence={evidence}
            bookmarks={bookmarks}
            onOpenEvidence={handleOpenEvidence}
          />
        </div>

        <div className="workspace-col card">
          <h3>Personal Notes</h3>
          <p className="hint-text" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            Notes are attached to evidence items from the Evidence Catalogue.
          </p>
          <NotesList
            evidence={evidence}
            notesStore={notes}
            onOpenEvidence={handleOpenEvidence}
          />
        </div>
      </div>

      <HypothesisForm people={people} evidence={evidence} />
    </section>
  );
};
