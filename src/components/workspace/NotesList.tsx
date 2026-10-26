import React from 'react';
import type { Evidence } from '../../types.js';

export interface NotesListProps {
  evidence: Evidence[];
  notesStore: Record<string, string>;
  onOpenEvidence?: (id: string) => void;
}

export const NotesList: React.FC<NotesListProps> = ({
  evidence,
  notesStore,
  onOpenEvidence,
}) => {
  const noteEntries = evidence
    .filter((ev) => Boolean(notesStore[ev.id]))
    .map((ev) => ({
      evidenceId: ev.id,
      title: ev.title,
      text: notesStore[ev.id],
    }));

  if (noteEntries.length === 0) {
    return (
      <div id="notesList" className="notes-list">
        <p style={{ color: 'var(--color-text-muted)' }}>
          No notes yet. Add one from an evidence item&apos;s detail view.
        </p>
      </div>
    );
  }

  return (
    <div id="notesList" className="notes-list">
      {noteEntries.map((entry) => (
        <div key={entry.evidenceId} className="mini-list-item" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{entry.evidenceId}</strong> &mdash; {entry.title}
            </div>
            {onOpenEvidence && (
              <button
                type="button"
                className="btn btn-small btn-secondary"
                onClick={() => onOpenEvidence(entry.evidenceId)}
              >
                Open
              </button>
            )}
          </div>
          <div style={{ marginTop: '0.25rem', whiteSpace: 'pre-wrap', color: 'var(--color-text-muted)' }}>
            {entry.text}
          </div>
        </div>
      ))}
    </div>
  );
};
