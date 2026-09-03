import {
  state,
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  applyStoredBookmarkFlags,
  loadNoteAsync
} from './state.js';

// Route registry mapping views to their HTML and JS endpoints
const routes = {
  dashboard: {
    html: 'pages/dashboard/index.html',
    js: './pages/dashboard/script.js'
  },
  evidence: {
    html: 'pages/evidence/index.html',
    js: './pages/evidence/script.js'
  },
  people: {
    html: 'pages/people_locations/index.html',
    js: './pages/people_locations/script.js'
  },
  timeline: {
    html: 'pages/timeline/index.html',
    js: './pages/timeline/script.js'
  },
  workspace: {
    html: 'pages/workspace/index.html',
    js: './pages/workspace/script.js'
  }
};

// ---------------------------------------------------------------------
// LOADING OVERLAY HELPERS
// ---------------------------------------------------------------------

function showLoadingOverlay(msg) {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

// Bug (Demo 3/4): loadingStepsRemaining is decremented here.
// loadEvidenceData() never calls hideLoadingStep(), so if timeline
// also fails to reach its .finally(), the overlay may never hide.
function hideLoadingStep() {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

// ---------------------------------------------------------------------
// DATA FETCHING (BOOTSTRAP)
// ---------------------------------------------------------------------

// Loads evidence.json independently (not awaited by the caller).
// Note: intentionally never calls hideLoadingStep() — the counter
// only ticks down via loadCorePeopleAndLocations and loadTimelineData.
function loadEvidenceData() {
  fetch("../data/evidence.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      state.allEvidence = data;
      applyStoredBookmarkFlags();
      state.filteredEvidence = state.allEvidence;
      // Bug fix (Demo 3): evidenceViewLoading was never reset to false after the
      // fetch resolved, so renderEvidenceList() always hit the early-return spinner
      // path and the evidence list was never rendered.
      state.evidenceViewLoading = false;
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

function loadTimelineData() {
  return fetch("../data/timeline.json")
    .then(function (res) { return res.json(); })
    .then(function (data) {
      state.allTimeline = data;
    })
    .catch(function (err) {
      console.log("timeline load error", err);
    })
    .finally(function () {
      hideLoadingStep();
    });
}

function loadCorePeopleAndLocations() {
  return fetch("../data/case.json").then(function (caseRes) {
    return caseRes.json().then(function (caseJson) {
      state.caseData = caseJson;

      return fetch("../data/people.json").then(function (peopleRes) {
        return peopleRes.json().then(function (peopleJson) {
          state.allPeople = peopleJson;

          return fetch("../data/locations.json").then(function (locationsRes) {
            return locationsRes.json().then(function (locationsJson) {
              state.allLocations = locationsJson;
              hideLoadingStep();
            });
          });
        });
      });
    });
  });
}

function loadAllData() {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;
  return loadCorePeopleAndLocations().then(function () {
    loadEvidenceData();
    loadTimelineData();
  });
}

// ---------------------------------------------------------------------
// ROUTER & NAVIGATION
// ---------------------------------------------------------------------

export async function navigateTo(viewName) {
  window.location.hash = viewName;
}
window.navigateTo = navigateTo; // Expose globally for inline buttons in HTML snippets

async function handleHashChange() {
  let view = window.location.hash.replace("#", "").trim();
  if (!routes[view]) {
    view = "dashboard";
  }
  state.currentPage = view;

  // 1. Highlight current header nav button
  document.querySelectorAll(".nav-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === view);
  });

  const appContainer = document.getElementById("app");
  const targetRoute = routes[view];

  try {
    // 2. Fetch and inject view's HTML snippet
    const res = await fetch(targetRoute.html);
    if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${targetRoute.html}`);
    appContainer.innerHTML = await res.text();

    // --- FIX: Add the 'active' class so styles.css displays the view ---
    const viewSection = appContainer.querySelector(".view");
    if (viewSection) {
      viewSection.classList.add("active");
    }

    // 3. Dynamically import the page's JS and run its init()
    const module = await import(targetRoute.js);
    if (typeof module.init === "function") {
      module.init();
    }
  } catch (err) {
    console.error(`Error loading view [${view}]:`, err);
    appContainer.innerHTML = `<p class="error-msg">Failed to load view: ${view}</p>`;
  }
}

// ---------------------------------------------------------------------
// INITIALIZATION
// ---------------------------------------------------------------------

async function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();

  // Bug (Demo 8): classic var-in-loop closure — the anonymous function captures
  // the variable `i`, not its value, so by the time any click fires, `i` equals
  // navButtons.length and navButtons[i] is undefined.
  var navButtons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      var targetView = navButtons[i].getAttribute("data-view");
      console.log("nav clicked:", targetView);
    });
  }

  window.addEventListener("hashchange", handleHashChange);

  loadAllData().then(async function () {
    handleHashChange();
    // Bug (Demo 3): loadNoteAsync returns a Promise but it is logged directly
    // without .then() or await, so the console shows the Promise object itself.
    var firstNote = await loadNoteAsync("E01");
    console.log("First note preview:", firstNote);
  });
}

window.addEventListener("DOMContentLoaded", initApp);