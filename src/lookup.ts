import { state } from './state.js';
import type { Evidence, Person, Location } from './types.js';

export function findEvidenceById(id: string): Evidence | null {
  const items = state.allEvidence as Evidence[];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

export function findPersonById(id: string): Person | null {
  const items = state.allPeople as Person[];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

export function findLocationById(id: string): Location | null {
  const items = state.allLocations as Location[];
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return items[i];
  }
  return null;
}

export function evidenceMentionsPerson(ev: Evidence | null | undefined, person: Person): boolean {
  if (!ev || !ev.personIds) return false;
  return ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1;
}
