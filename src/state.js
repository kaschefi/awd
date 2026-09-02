export const STORAGE_KEY_BOOKMARKS = "remotion_bookmarks";
export const STORAGE_KEY_NOTES = "remotion_notes";
export const STORAGE_KEY_HYPOTHESIS = "remotion_hypothesis";

// Central mutable state store
export const state = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {},

  currentPeopleTab: "people",
  loadingStepsRemaining: 2,
  evidenceViewLoading: true,
  modalCloseListenerCount: 0,
  notesStore: {}
};

// --- Storage Handlers ---

export function saveBookmarksToStorage() {
  localStorage.setItem(STORAGE_KEY_BOOKMARKS, JSON.stringify(state.bookmarks));
}

export function loadBookmarksFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKMARKS);
    const parsed = raw ? JSON.parse(raw) : [];
    state.bookmarks = Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Could not read stored bookmarks, starting empty", err);
    state.bookmarks = [];
  }
}

export function applyStoredBookmarkFlags() {
  for (let i = 0; i < state.allEvidence.length; i++) {
    state.allEvidence[i].bookmarked = state.bookmarks.indexOf(state.allEvidence[i].id) !== -1;
  }
}

export function saveNoteForEvidence(evidenceId, text) {
  state.notesStore[evidenceId] = text;
  localStorage.setItem(STORAGE_KEY_NOTES, JSON.stringify(state.notesStore));
}

export function loadNoteForEvidence(evidenceId) {
  return state.notesStore[evidenceId] || "";
}

export function loadNotesFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY_NOTES);
  if (!raw) {
    state.notesStore = {};
    return;
  }
  try {
    state.notesStore = JSON.parse(raw);
  } catch (err) {
    console.warn("Could not read stored notes, resetting", err);
    state.notesStore = {};
  }
}

// Bug (Demo 3): returns a Promise — callers that log the return value directly
// will see "Promise { <pending> }" instead of the note text.
export function loadNoteAsync(evidenceId) {
  return new Promise(function (resolve) {
    resolve(state.notesStore[evidenceId] || "");
  });
}