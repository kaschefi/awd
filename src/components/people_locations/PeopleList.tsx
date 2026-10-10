import React from 'react';
import type { Person, Evidence } from '../../types.js';
import { PersonCard } from './PersonCard.js';
import { evidenceMentionsPerson } from '../../lookup.js';
import { state } from '../../state.js';

export interface PeopleListProps {
  people: Person[];
  evidenceList?: Evidence[];
  onViewEvidence?: (personId: string) => void;
}

export const PeopleList: React.FC<PeopleListProps> = ({
  people,
  evidenceList = state.allEvidence,
  onViewEvidence,
}) => {
  if (people.length === 0) {
    return <p className="empty-state">No people registered.</p>;
  }

  return (
    <div className="people-grid">
      {people.map((person) => {
        const evidenceCount = evidenceList.filter((ev) =>
          evidenceMentionsPerson(ev, person)
        ).length;

        return (
          <PersonCard
            key={person.id}
            person={person}
            evidenceCount={evidenceCount}
            onViewEvidence={onViewEvidence}
          />
        );
      })}
    </div>
  );
};
