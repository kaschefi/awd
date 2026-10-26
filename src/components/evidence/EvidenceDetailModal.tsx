import React, { useState, useEffect } from 'react';
import type { Evidence, Person, Location, EvidenceStatus, EvidenceRelevance } from '../../types.js';
import { formatDate } from '../../formatters.js';

export interface EvidenceDetailModalProps {
  evidence: Evidence | null;
  people: Person[];
  locations: Location[];
  onClose: () => void;
  onUpdateStatus?: (evidenceId: string, status: EvidenceStatus) => void;
  onUpdateRelevance?: (evidenceId: string, relevance: EvidenceRelevance) => void;
  onSaveNote?: (evidenceId: string, noteText: string) => void;
  initialNote?: string;
}

export const EvidenceDetailModal: React.FC<EvidenceDetailModalProps> = ({
  evidence,
  people,
  locations,
  onClose,
  onUpdateStatus,
  onUpdateRelevance,
  onSaveNote,
  initialNote = '',
}) => {
  const [noteText, setNoteText] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  useEffect(() => {
    setNoteText(initialNote);
    setSavedNote(initialNote);
  }, [initialNote, evidence?.id]);

  if (!evidence) return null;

  const handleSave = () => {
    onSaveNote?.(evidence.id, noteText);
    setSavedNote(noteText);
    setShowSavedMsg(true);
    setTimeout(() => setShowSavedMsg(false), 2000);
  };

  const personNames = (evidence.personIds || []).map((pId) => {
    const found = people.find((p) => p.id === pId || p.name === pId);
    return found ? found.name : pId;
  });

  const locationNames = (evidence.locationIds || []).map((lId) => {
    const found = locations.find((l) => l.id === lId);
    return found ? `${found.id} - ${found.name}` : lId;
  });

  return (
    <section id="evidenceDetailSection" className="evidence-detail" style={{ marginTop: '2rem' }}>
      <div className="evidence-detail-header">
        <div>
          <h2>{evidence.title}</h2>
          <div className="evidence-meta">
            {evidence.id} &middot; {evidence.type} &middot; {formatDate(evidence.timestamp)}
          </div>
        </div>
        <button
          type="button"
          id="closeDetailBtn"
          className="btn btn-secondary btn-small"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      {evidence.tags && evidence.tags.includes('critical') && (
        <div className="warning-banner">This item is tagged as critical evidence.</div>
      )}

      <div className="detail-field">
        <strong>Summary</strong>
        <p>{evidence.summary}</p>
      </div>

      <div className="evidence-detail-content" style={{ whiteSpace: 'pre-wrap' }}>
        {evidence.content}
      </div>

      <div className="detail-field">
        <strong>Related people</strong>
        <p>{personNames.length > 0 ? personNames.join(', ') : 'None specified'}</p>
      </div>

      <div className="detail-field">
        <strong>Related locations</strong>
        <p>{locationNames.length > 0 ? locationNames.join(', ') : 'None specified'}</p>
      </div>

      {evidence.tags && evidence.tags.length > 0 && (
        <div className="detail-field">
          <strong>Tags</strong>
          <div style={{ marginTop: '0.25rem' }}>
            {evidence.tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="detail-field">
        <strong>Review status</strong>
        <select
          id="detailStatusSelect"
          value={evidence.status}
          onChange={(e) => onUpdateStatus?.(evidence.id, e.target.value as EvidenceStatus)}
        >
          <option value="unreviewed">Unreviewed</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>
      </div>

      <div className="detail-field">
        <strong>Relevance</strong>
        <select
          id="detailRelevanceSelect"
          value={evidence.relevance}
          onChange={(e) => onUpdateRelevance?.(evidence.id, e.target.value as EvidenceRelevance)}
        >
          <option value="unknown">Unknown</option>
          <option value="relevant">Relevant</option>
          <option value="irrelevant">Irrelevant</option>
        </select>
      </div>

      <div className="detail-field">
        <strong>Investigator note</strong>
        <textarea
          id="evidenceNoteInput"
          className="note-textarea"
          rows={3}
          placeholder="Add a private note about this evidence..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '6px' }}>
          <button
            type="button"
            id="saveNoteBtn"
            className="btn btn-primary btn-small"
            onClick={handleSave}
          >
            Save note
          </button>
          {showSavedMsg && <span className="saved-msg">Saved</span>}
        </div>
      </div>

      <div className="detail-field">
        <strong>Note preview</strong>
        <div id="notePreview" style={{ minHeight: '1.5rem', fontStyle: savedNote ? 'normal' : 'italic', color: savedNote ? 'inherit' : 'var(--color-text-muted)' }}>
          {savedNote || '(No note saved)'}
        </div>
      </div>
    </section>
  );
};
