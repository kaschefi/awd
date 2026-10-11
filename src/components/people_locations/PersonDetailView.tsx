import React from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Person, Evidence } from '../../types.js';
import { PersonCard } from './PersonCard.js';
import { evidenceMentionsPerson } from '../../lookup.js';
import { state } from '../../state.js';

export interface PersonDetailViewProps {
  people: Person[];
  evidenceList?: Evidence[];
  onViewEvidence?: (personId: string) => void;
}

/**
 * Parameterized route view for /team/people/:personId.
 * Reads route parameter personId using useParams() and renders
 * the specific person's profile and dossier, with safe fallback.
 */
export const PersonDetailView: React.FC<PersonDetailViewProps> = ({
  people,
  evidenceList = state.allEvidence,
  onViewEvidence,
}) => {
  // useParams returns Record<string, string | undefined>
  const { personId } = useParams<{ personId: string }>();

  // Safe lookup: check if person exists in loaded dataset
  const person = personId ? people.find((p) => p.id === personId) : undefined;

  // Safe guard: Handle unknown or non-existent person ID
  if (!person) {
    return (
      <div
        className="card empty-state"
        style={{
          padding: '2.5rem',
          textAlign: 'center',
          maxWidth: '650px',
          margin: '1.5rem auto',
          borderTop: '4px solid var(--color-critical)',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
        <h3 style={{ color: 'var(--color-critical)', marginBottom: '0.5rem' }}>
          Team Member Not Found
        </h3>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          No team member found with identifier <code>{personId || '(none)'}</code>.
        </p>
        <Link to="/team/people" className="btn btn-primary">
          &larr; Back to all personnel
        </Link>
      </div>
    );
  }

  const evidenceCount = evidenceList.filter((ev) => evidenceMentionsPerson(ev, person)).length;

  return (
    <div className="person-detail-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <Link to="/team/people" className="btn btn-secondary btn-small">
          &larr; Back to all personnel ({people.length})
        </Link>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          Profile ID: <code>{person.id}</code>
        </span>
      </div>

      <PersonCard
        person={person}
        evidenceCount={evidenceCount}
        onViewEvidence={onViewEvidence}
      />

      {person.background && (
        <div className="card" style={{ marginTop: '1.25rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-header)' }}>
            Background Dossier
          </h4>
          <p style={{ margin: 0, lineHeight: 1.6, color: 'var(--color-text)' }}>
            {person.background}
          </p>
        </div>
      )}
    </div>
  );
};
