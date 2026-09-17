import type { AppState } from './types.js';

export const STORAGE_KEY_BOOKMARKS = 'remotion_bookmarks';
export const STORAGE_KEY_NOTES = 'remotion_notes';
export const STORAGE_KEY_HYPOTHESIS = 'remotion_hypothesis';

// Central mutable state store
export const state: AppState = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: 'dashboard',

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {},

  currentPeopleTab: 'people',
  loadingStepsRemaining: 2,
  evidenceViewLoading: true,
  modalCloseListenerCount: 0,
  notesStore: {},
};

// --- Storage Handlers ---

export function saveBookmarksToStorage(): void {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
}

export function loadBookmarksFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch (err) {
    console.warn('Could not read stored bookmarks, starting empty', err);
    state.bookmarks = [];
  }
}

export function applyStoredBookmarkFlags(): void {
  for (let i = 0; i < state.allEvidence.length; i++) {
    const item = state.allEvidence[i];
    if (item) {
      item.bookmarked = state.bookmarks.indexOf(item.id) !== -1;
    }
  }
}

export function saveNoteForEvidence(evidenceId: string, text: string): void {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
}

export function loadNoteForEvidence(evidenceId: string): string {
  return state.notesStore[evidenceId] || '';
}

export function loadNotesFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    state.notesStore =
      typeof parsed === 'object' && parsed !== null ? (parsed as Record<string, string>) : {};
  } catch (err) {
    console.warn('Could not read stored notes, resetting', err);
    state.notesStore = {};
  }
}

// Bug (Demo 3): returns a Promise — callers that log the return value directly
// will see "Promise { <pending> }" instead of the note text.
export function loadNoteAsync(evidenceId: string): Promise<string> {
  return new Promise(function (resolve) {
    resolve(state.notesStore[evidenceId] || '');
  });
}
