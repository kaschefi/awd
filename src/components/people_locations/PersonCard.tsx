import React from 'react';
import { Link } from 'react-router-dom';
import type { Person } from '../../types.js';
import { Card } from '../common/Card.js';

export interface PersonCardProps {
  person: Person;
  evidenceCount?: number;
  onViewEvidence?: (personId: string) => void;
  isDetail?: boolean;
}

export const PersonCard: React.FC<PersonCardProps> = ({
  person,
  evidenceCount = 0,
  onViewEvidence,
  isDetail = false,
}) => {
  const avatarSrc = './' + person.avatar.replace(/^\//, '').replace(/\.png$/i, '.webp');

  return (
    <Card className="person-card">
      <div className="person-card-header">
        <img
          className="person-avatar"
          src={avatarSrc}
          alt={`Portrait of ${person.name}`}
        />
        <div>
          <h3>
            {isDetail ? (
              person.name
            ) : (
              <Link
                to={`/team/people/${person.id}`}
                style={{ color: 'inherit', textDecoration: 'none' }}
                title={`View full profile of ${person.name}`}
              >
                {person.name} &rarr;
              </Link>
            )}
          </h3>
          <div className="person-role">{person.role}</div>
        </div>
      </div>

      <p>
        <strong>Speciality:</strong> {person.speciality}
      </p>

      <ul>
        {person.responsibilities.map((responsibility) => (
          <li key={responsibility}>{responsibility}</li>
        ))}
      </ul>

      <div className="person-statement">&ldquo;{person.statement}&rdquo;</div>

      <p>
        {evidenceCount} related evidence item{evidenceCount === 1 ? '' : 's'} &mdash;{' '}
        {onViewEvidence ? (
          <button
            type="button"
            className="evidence-count-link"
            onClick={() => onViewEvidence(person.id)}
          >
            view
          </button>
        ) : (
          <span className="text-muted">(none)</span>
        )}
      </p>

      {!isDetail && (
        <div style={{ marginTop: '0.75rem' }}>
          <Link
            to={`/team/people/${person.id}`}
            className="btn btn-secondary btn-small"
            style={{ fontSize: '0.8rem' }}
          >
            View Dossier &rarr;
          </Link>
        </div>
      )}
    </Card>
  );
};
