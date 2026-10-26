import React, { useState, useEffect } from 'react';
import type { Person, Evidence, HypothesisDraft } from '../../types.js';
import { STORAGE_KEY_HYPOTHESIS } from '../../state.js';

export interface HypothesisFormProps {
  people: Person[];
  evidence: Evidence[];
  onSave?: (draft: HypothesisDraft) => void;
}

export const HypothesisForm: React.FC<HypothesisFormProps> = ({
  people,
  evidence,
  onSave,
}) => {
  const [suspect, setSuspect] = useState('');
  const [nature, setNature] = useState<'accidental' | 'deliberate' | 'unclear' | ''>('');
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([]);
  const [confidence, setConfidence] = useState(50);
  const [explanation, setExplanation] = useState('');
  const [alternative, setAlternative] = useState('');
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Load saved hypothesis draft on mount from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.suspectId || parsed.suspect) setSuspect(parsed.suspectId || parsed.suspect);
        if (parsed.nature) setNature(parsed.nature);
        if (Array.isArray(parsed.evidenceIds)) setSelectedEvidenceIds(parsed.evidenceIds);
        if (parsed.confidence !== undefined) setConfidence(Number(parsed.confidence));
        if (parsed.explanation) setExplanation(parsed.explanation);
        if (parsed.alternative) setAlternative(parsed.alternative);
      }
    } catch (err) {
      console.warn('Failed to load hypothesis draft from storage:', err);
    }
  }, []);

  const handleEvidenceSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
    setSelectedEvidenceIds(selectedOptions);
  };

  const handleSaveHypothesis = (e: React.FormEvent) => {
    e.preventDefault();

    const draft: HypothesisDraft = {
      suspect,
      nature,
      evidenceIds: selectedEvidenceIds,
      confidence,
      explanation,
      alternative,
    };

    try {
      // Legacy compatibility format
      const storagePayload = {
        suspectId: suspect,
        suspect,
        nature,
        evidenceIds: selectedEvidenceIds,
        confidence,
        explanation,
        alternative,
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
            value={suspect}
            onChange={(e) => setSuspect(e.target.value)}
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
            value={nature}
            onChange={(e) =>
              setNature(e.target.value as 'accidental' | 'deliberate' | 'unclear' | '')
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
            value={selectedEvidenceIds}
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
            value={confidence}
            onChange={(e) => setConfidence(Number(e.target.value))}
          />
          <output id="hypConfidenceValue">{confidence}</output>
        </div>

        <div className="form-row">
          <label htmlFor="hypExplanation">Written explanation</label>
          <textarea
            id="hypExplanation"
            rows={4}
            placeholder="Explain your reasoning…"
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="hypAlternative">Alternative explanation</label>
          <textarea
            id="hypAlternative"
            rows={3}
            placeholder="What else could explain the evidence?"
            value={alternative}
            onChange={(e) => setAlternative(e.target.value)}
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
