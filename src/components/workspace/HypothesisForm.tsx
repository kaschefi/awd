import React, { useState, useEffect } from 'react';
import type { Person, Evidence, HypothesisDraft } from '../../types.js';
import { STORAGE_KEY_HYPOTHESIS } from '../../state.js';

export interface HypothesisFormProps {
  people: Person[];
  evidence: Evidence[];
  onSave?: (draft: HypothesisDraft) => void;
}

const initialDraft: HypothesisDraft = {
  suspect: '',
  nature: '',
  evidenceIds: [],
  confidence: 50,
  explanation: '',
  alternative: '',
};

export const HypothesisForm: React.FC<HypothesisFormProps> = ({
  people,
  evidence,
  onSave,
}) => {
  // Demo 2: Single object state for all form fields
  const [draft, setDraft] = useState<HypothesisDraft>(initialDraft);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Load saved hypothesis draft on mount from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
      if (raw) {
        const parsed = JSON.parse(raw);
        setDraft({
          suspect: parsed.suspectId || parsed.suspect || '',
          nature: parsed.nature || '',
          evidenceIds: Array.isArray(parsed.evidenceIds) ? parsed.evidenceIds : [],
          confidence: parsed.confidence !== undefined ? Number(parsed.confidence) : 50,
          explanation: parsed.explanation || '',
          alternative: parsed.alternative || '',
        });
      }
    } catch (err) {
      console.warn('Failed to load hypothesis draft from storage:', err);
    }
  }, []);

  const updateDraft = <K extends keyof HypothesisDraft>(field: K, value: HypothesisDraft[K]) => {
    setDraft((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEvidenceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    updateDraft('evidenceIds', selectedOptions);
  };

  const handleSaveHypothesis = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Legacy compatibility format for any vanilla scripts reading storage
      const storagePayload = {
        ...draft,
        suspectId: draft.suspect,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(storagePayload));
      onSave?.(draft);

      setShowSavedMsg(true);
      setTimeout(() => setShowSavedMsg(false), 2000);
    } catch (err) {
      console.error('Could not save hypothesis draft', err);
      alert('Your hypothesis could not be saved to local storage.');
    }
  };

  return (
    <div className="hypothesis-card">
      <h3>Hypothesis Draft</h3>
      <form id="hypothesisForm" onSubmit={handleSaveHypothesis}>
        <div className="form-row">
          <label htmlFor="hypSuspect">Suspected responsible person</label>
          <select
            id="hypSuspect"
            value={draft.suspect}
            onChange={(e) => updateDraft('suspect', e.target.value)}
          >
            <option value="">Select a person…</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypNature">Accidental or deliberate incident</label>
          <select
            id="hypNature"
            value={draft.nature}
            onChange={(e) =>
              updateDraft(
                'nature',
                e.target.value as 'accidental' | 'deliberate' | 'unclear' | ''
              )
            }
          >
            <option value="">Select…</option>
            <option value="accidental">Accidental</option>
            <option value="deliberate">Deliberate</option>
            <option value="unclear">Unclear</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypEvidence">Selected supporting evidence</label>
          <select
            id="hypEvidence"
            multiple
            size={6}
            value={draft.evidenceIds}
            onChange={handleEvidenceSelectChange}
          >
            {evidence.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.id} - {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="hypConfidence">Confidence (0&ndash;100)</label>
          <input
            type="range"
            id="hypConfidence"
            min="0"
            max="100"
            value={draft.confidence}
            onChange={(e) => updateDraft('confidence', Number(e.target.value))}
          />
          <output id="hypConfidenceValue">{draft.confidence}</output>
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanation">Written explanation</label>
          <textarea
            id="hypExplanation"
            rows={4}
            placeholder="Explain your reasoning…"
            value={draft.explanation}
            onChange={(e) => updateDraft('explanation', e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternative">Alternative explanation</label>
          <textarea
            id="hypAlternative"
            rows={3}
            placeholder="What else could explain the evidence?"
            value={draft.alternative}
            onChange={(e) => updateDraft('alternative', e.target.value)}
          />
        </div>

        <div className="form-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary">
            Save hypothesis draft
          </button>
          {showSavedMsg && <span id="hypothesisSavedMsg" className="saved-msg">Saved</span>}
        </div>
      </form>
    </div>
  );
};
