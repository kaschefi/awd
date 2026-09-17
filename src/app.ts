import {
  state,
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  applyStoredBookmarkFlags,
  loadNoteAsync,
} from './state.js';

import {
  fetchCaseData,
  fetchEvidenceData,
  fetchLocationsData,
  fetchPeopleData,
  fetchTimelineData,
} from './dataLoader.js';

interface RouteEntry {
  loadHtml: () => Promise<{ default: string }>;
  loadModule: () => Promise<{ init?: () => void }>;
}

// Route registry mapping views to dynamic imports (enables Vite production code-splitting and bundling)
const routes: Record<string, RouteEntry> = {
  dashboard: {
    loadHtml: () => import('./pages/dashboard/index.html?raw'),
    loadModule: () => import('./pages/dashboard/script.js'),
  },
  evidence: {
    loadHtml: () => import('./pages/evidence/index.html?raw'),
    loadModule: () => import('./pages/evidence/script.js'),
  },
  people: {
    loadHtml: () => import('./pages/people_locations/index.html?raw'),
    loadModule: () => import('./pages/people_locations/script.js'),
  },
  timeline: {
    loadHtml: () => import('./pages/timeline/index.html?raw'),
    loadModule: () => import('./pages/timeline/script.js'),
  },
  workspace: {
    loadHtml: () => import('./pages/workspace/index.html?raw'),
    loadModule: () => import('./pages/workspace/script.js'),
  },
};

// ---------------------------------------------------------------------
// LOADING OVERLAY HELPERS
// ---------------------------------------------------------------------

function showLoadingOverlay(msg: string): void {
  const overlay = document.getElementById('loadingOverlay');
  const text = document.getElementById('loadingText');
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove('hidden');
}

// Bug (Demo 3/4): loadingStepsRemaining is decremented here.
// loadEvidenceData() never calls hideLoadingStep(), so if timeline
// also fails to reach its .finally(), the overlay may never hide.
function hideLoadingStep(): void {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
  }
}

// ---------------------------------------------------------------------
// DATA FETCHING (BOOTSTRAP)
// ---------------------------------------------------------------------

// Loads evidence.json independently (not awaited by the caller).
// Note: intentionally never calls hideLoadingStep() — the counter
// only ticks down via loadCorePeopleAndLocations and loadTimelineData.
function loadEvidenceData(): void {
  fetchEvidenceData()
    .then(function (data) {
      state.allEvidence = data;
      applyStoredBookmarkFlags();
      state.filteredEvidence = state.allEvidence;
      // Bug fix (Demo 3): evidenceViewLoading was never reset to false after the
      // fetch resolved, so renderEvidenceList() always hit the early-return spinner
      // path and the evidence list was never rendered.
      state.evidenceViewLoading = false;
    })
    .catch(function (err: unknown) {
      console.error('Failed to load evidence.json', err);
      alert('Evidence could not be loaded. Some views may be incomplete.');
    });
}

async function loadTimelineData(): Promise<void> {
  try {
    state.allTimeline = await fetchTimelineData();
  } catch (err: unknown) {
    console.log('timeline load error', err);
  } finally {
    hideLoadingStep();
  }
}

async function loadCorePeopleAndLocations(): Promise<void> {
  state.caseData = await fetchCaseData();
  state.allPeople = await fetchPeopleData();
  state.allLocations = await fetchLocationsData();

  hideLoadingStep();
}

async function loadAllData(): Promise<void> {
  showLoadingOverlay('Loading case file…');
  state.loadingStepsRemaining = 2;
  await loadCorePeopleAndLocations();
  loadEvidenceData();
  await loadTimelineData();
}

// ---------------------------------------------------------------------
// ROUTER & NAVIGATION
// ---------------------------------------------------------------------

export async function navigateTo(viewName: string): Promise<void> {
  window.location.hash = viewName;
}

declare global {
  interface Window {
    navigateTo: (viewName: string) => Promise<void>;
  }
}
window.navigateTo = navigateTo; // Expose globally for inline buttons in HTML snippets

async function handleHashChange(): Promise<void> {
  let view = window.location.hash.replace('#', '').trim();
  if (!routes[view]) {
    view = 'dashboard';
  }
  state.currentPage = view;

  // 1. Highlight current header nav button
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-view') === view);
  });

  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  const targetRoute = routes[view];

  try {
    // 2. Load and inject view's HTML snippet
    const htmlModule = await targetRoute.loadHtml();
    appContainer.innerHTML = htmlModule.default;

    // --- FIX: Add the 'active' class so styles.css displays the view ---
    const viewSection = appContainer.querySelector('.view');
    if (viewSection) {
      viewSection.classList.add('active');
    }

    // 3. Dynamically import the page's JS and run its init()
    const module = await targetRoute.loadModule();
    if (typeof module.init === 'function') {
      module.init();
    }
  } catch (err: unknown) {
    console.error(`Error loading view [${view}]:`, err);
    appContainer.innerHTML = `<p class="error-msg">Failed to load view: ${view}</p>`;
  }
}

// ---------------------------------------------------------------------
// INITIALIZATION
// ---------------------------------------------------------------------

async function initApp(): Promise<void> {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  console.warn("that's a warning");
  console.error('this is an error');
  // Fixed code smell: use forEach so each callback has its own button reference instead of broken var i
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetView = btn.getAttribute('data-view');
      console.log('nav clicked:', targetView);
    });
  });

  window.addEventListener('hashchange', handleHashChange);

  // only show dashboard after all data is loaded
  loadAllData().then(async function () {
    handleHashChange();
    // Bug (Demo 3): loadNoteAsync returns a Promise but it is logged directly
    // without .then() or await, so the console shows the Promise object itself.
    const firstNote = await loadNoteAsync('E01');
    console.log('First note preview:', firstNote);
  });
}

window.addEventListener('DOMContentLoaded', initApp);
