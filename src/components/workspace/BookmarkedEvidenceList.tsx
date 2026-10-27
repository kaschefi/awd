import React from 'react';
import type { Evidence } from '../../types.js';
import { useBookmarks } from '../../context/BookmarkContext.js';

export interface BookmarkedEvidenceListProps {
  evidence: Evidence[];
  bookmarks?: string[];
  onOpenEvidence?: (id: string) => void;
}

export const BookmarkedEvidenceList: React.FC<BookmarkedEvidenceListProps> = ({
  evidence,
  bookmarks: propBookmarks,
  onOpenEvidence,
}) => {
  const { bookmarks: contextBookmarks } = useBookmarks();
  const bookmarks = propBookmarks ?? contextBookmarks;
  const bookmarkedItems = evidence.filter((ev) => bookmarks.includes(ev.id));

  if (bookmarkedItems.length === 0) {
    return (
      <div id="bookmarksList" className="bookmarks-list">
        <p style={{ color: 'var(--color-text-muted)' }}>
          No bookmarked evidence yet. Bookmark items from the Evidence view.
        </p>
      </div>
    );
  }

  return (
    <div id="bookmarksList" className="bookmarks-list">
      {bookmarkedItems.map((ev) => (
        <div key={ev.id} className="mini-list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
          <div>
            <strong>{ev.id}</strong> &mdash; {ev.title}
          </div>
          {onOpenEvidence && (
            <button
              type="button"
              className="btn btn-small btn-secondary"
              onClick={() => onOpenEvidence(ev.id)}
            >
              Open
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
