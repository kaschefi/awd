import { state } from './state.js';

export interface IdentifiedEntity {
  id: string;
  name?: string;
  [key: string]: unknown;
}

export interface EvidenceItem extends IdentifiedEntity {
  personIds?: string[];
}

export function findEvidenceById(id: string): EvidenceItem | null {
  const items = state.allEvidence as EvidenceItem[];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

export function findPersonById(id: string): IdentifiedEntity | null {
  const items = state.allPeople as IdentifiedEntity[];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

export function findLocationById(id: string): IdentifiedEntity | null {
  const items = state.allLocations as IdentifiedEntity[];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

export function evidenceMentionsPerson(
  ev: EvidenceItem | null | undefined,
  person: IdentifiedEntity
): boolean {
  if (!ev || !ev.personIds) return false;
  return (
    ev.personIds.indexOf(person.id) !== -1 ||
    (person.name !== undefined && ev.personIds.indexOf(person.name) !== -1)
  );
}
