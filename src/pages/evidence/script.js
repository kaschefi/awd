import { state, saveBookmarksToStorage, saveNoteForEvidence, loadNoteForEvidence } from '../../state.js';
import { findEvidenceById, findPersonById, findLocationById, evidenceMentionsPerson, formatDate, getStatusBadgeClass, getRelevanceBadgeClass } from '../../utils.js';

var latestSearchRequestId = 0;

export function populateEvidenceDropdowns() {
  var typeSelect = document.getElementById("filterType");
  var personSelect = document.getElementById("filterPerson");
  var locationSelect = document.getElementById("filterLocation");
  if (!typeSelect || !personSelect || !locationSelect) return;

  var types = [];
  for (var i = 0; i < state.allEvidence.length; i++) {
    var t = state.allEvidence[i].type.toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }
  typeSelect.innerHTML = '<option value="">All types</option>';
  for (var ti = 0; ti < types.length; ti++) {
    typeSelect.innerHTML += '<option value="' + types[ti] + '">' + types[ti] + "</option>";
  }

  personSelect.innerHTML = '<option value="">All people</option>';
  for (var p = 0; p < state.allPeople.length; p++) {
    personSelect.innerHTML += '<option value="' + state.allPeople[p].id + '">' + state.allPeople[p].name + "</option>";
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (var l = 0; l < state.allLocations.length; l++) {
    locationSelect.innerHTML += '<option value="' + state.allLocations[l].id + '">' + state.allLocations[l].id + " - " + state.allLocations[l].name + "</option>";
  }
}

export function getFilteredEvidence() {
  var searchBox = document.getElementById("evidenceSearch");
  var searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : "";
  var typeVal = document.getElementById("filterType") ? document.getElementById("filterType").value : "";
  var personVal = document.getElementById("filterPerson") ? document.getElementById("filterPerson").value : "";
  var locationVal = document.getElementById("filterLocation") ? document.getElementById("filterLocation").value : "";
  var statusVal = document.getElementById("filterStatus") ? document.getElementById("filterStatus").value : "";
  var relevanceVal = document.getElementById("filterRelevance") ? document.getElementById("filterRelevance").value : "";

  var results = [];
  for (var i = 0; i < state.allEvidence.length; i++) {
    var item = state.allEvidence[i];
    var matches = true;

    if (searchTerm) {
      var haystack = (item.title + " " + item.summary + " " + item.tags.join(" ")).toLowerCase();
      if (haystack.indexOf(searchTerm) === -1) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
    if (matches && personVal) {
      var person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1) matches = false;
    if (matches && statusVal && (item.status || "").toLowerCase() !== statusVal) matches = false;
    if (matches && relevanceVal && (item.relevance || "").toLowerCase() !== relevanceVal) matches = false;

    if (matches) results.push(item);
  }

  // Apply current sort order
  var sortEl = document.getElementById("sortEvidence");
  var sortValue = sortEl ? sortEl.value : "date-desc";

  if (sortValue === "title-asc") {
    results.sort(function (a, b) {
      return a.title.localeCompare(b.title);
    });
  } else if (sortValue === "title-desc") {
    results.sort(function (a, b) {
      return b.title.localeCompare(a.title);
    });
  } else if (sortValue === "date-asc") {
    results.sort(function (a, b) {
      return new Date(a.timestamp) - new Date(b.timestamp);
    });
  } else {
    results.sort(function (a, b) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }

  state.filteredEvidence = results;
  return results;
}

export function renderEvidenceList() {
  var container = document.getElementById("evidenceList");
  if (!container) return;

  var loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (state.evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add("hidden");

  var results = getFilteredEvidence();

  var html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (var i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }
  container.innerHTML = html;
}

function renderEvidenceCardHTML(ev) {
  var isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  var html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html += '<button class="bookmark-btn ' + (isBookmarked ? "active" : "") + '" data-action="bookmark" data-id="' + ev.id + '" aria-label="Toggle bookmark for ' + ev.title + '"><span class="bookmark-icon">' + (isBookmarked ? "★" : "☆") + "</span></button>";
  html += "<h3>" + ev.title + "</h3>";
  html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div>";
  html += '<div class="evidence-summary">' + ev.summary + "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + "</span>";
  html += '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + "</span>";
  html += "<div>";
  for (var t = 0; t < ev.tags.length; t++) {
    html += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }
  html += "</div>";
  html += "</div>";
  return html;
}

function handleEvidenceListClick(event) {
  var target = event.target;

  if (target.dataset && target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id);
    return;
  }

  var card = target.closest(".evidence-card");
  if (card) {
    openEvidenceDetail(card.getAttribute("data-id"));
  }
}

function handleBookmarkClick(evidenceId) {
  var ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (state.bookmarks.indexOf(evidenceId) === -1) {
    state.bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter(function (id) {
      return id !== evidenceId;
    });
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  renderEvidenceList();
}

export function handleSortChange() {
  renderEvidenceList();
}

function clearFilters() {
  document.getElementById("evidenceSearch").value = "";
  document.getElementById("filterType").value = "";
  document.getElementById("filterPerson").value = "";
  document.getElementById("filterLocation").value = "";
  document.getElementById("filterStatus").value = "";
  document.getElementById("filterRelevance").value = "";
  renderEvidenceList();
}

function handleSearchInput(event) {
  var term = event.target.value;
  var requestId = ++latestSearchRequestId;

  setTimeout(function () {
    if (requestId !== latestSearchRequestId) return;
    renderEvidenceList();
  }, 300);
}

export function openEvidenceDetail(evidenceId) {
  var ev = findEvidenceById(evidenceId);
  if (!ev) return;
  state.selectedEvidence = ev;

  var section = document.getElementById("evidenceDetailSection");
  section.classList.remove("hidden");

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeEvidenceDetail() {
  var section = document.getElementById("evidenceDetailSection");
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
}

function renderEvidenceDetail(ev) {
  var section = document.getElementById("evidenceDetailSection");

  var personNames = [];
  for (var p = 0; p < ev.personIds.length; p++) {
    var person = findPersonById(ev.personIds[p]);
    personNames.push(person ? person.name : ev.personIds[p]);
  }

  var locationNames = [];
  for (var l = 0; l < ev.locationIds.length; l++) {
    var loc = findLocationById(ev.locationIds[l]);
    locationNames.push(loc ? loc.id + " - " + loc.name : ev.locationIds[l]);
  }

  var tagsHtml = "";
  for (var t = 0; t < ev.tags.length; t++) {
    tagsHtml += '<span class="tag-chip">' + ev.tags[t] + "</span>";
  }

  var storedNote = loadNoteForEvidence(ev.id);

  var html = "";
  html += '<div class="evidence-detail-header">';
  html += "<div><h2>" + ev.title + "</h2>";
  html += '<div class="evidence-meta">' + ev.id + " &middot; " + ev.type + " &middot; " + formatDate(ev.timestamp) + "</div></div>";
  html += '<button type="button" id="closeDetailBtn" class="btn btn-secondary btn-small">Close</button>';
  html += "</div>";

  if (ev.tags.indexOf("critical") !== -1) {
    html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + "</div>";
  html += '<div class="evidence-detail-content">' + ev.content + "</div>";
  html += '<div class="detail-field"><strong>Related people</strong>' + personNames.join(", ") + "</div>";
  html += '<div class="detail-field"><strong>Related locations</strong>' + locationNames.join(", ") + "</div>";
  html += '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + "</div>";

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, "unreviewed", "Unreviewed");
  html += statusOptionHTML(ev.status, "reviewed", "Reviewed");
  html += statusOptionHTML(ev.status, "flagged", "Flagged");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, "unknown", "Unknown");
  html += statusOptionHTML(ev.relevance, "relevant", "Relevant");
  html += statusOptionHTML(ev.relevance, "irrelevant", "Irrelevant");
  html += "</select></div>";

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html += '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' + ev.id + '" placeholder="Add a private note about this evidence...">' + storedNote + "</textarea>";
  html += '<button type="button" id="saveNoteBtn" class="btn btn-primary btn-small" style="margin-top:6px;">Save note</button>';
  html += "</div>";

  html += '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' + storedNote + "</div></div>";

  section.innerHTML = html;

  document.getElementById("closeDetailBtn").addEventListener("click", closeEvidenceDetail);
  document.getElementById("saveNoteBtn").addEventListener("click", saveCurrentNote);

  document.getElementById("detailStatusSelect").addEventListener("change", function (e) {
    ev.status = e.target.value;
    renderEvidenceDetail(ev);
    renderEvidenceList();
  });
  document.getElementById("detailRelevanceSelect").addEventListener("change", function (e) {
    ev.relevance = e.target.value;
    renderEvidenceDetail(ev);
    renderEvidenceList();
  });
}

function statusOptionHTML(current, value, label) {
  var currentLower = (current || "").toLowerCase();
  var selected = currentLower === value ? " selected" : "";
  return '<option value="' + value + '"' + selected + ">" + label + "</option>";
}

function saveCurrentNote() {
  var textarea = document.getElementById("evidenceNoteInput");
  if (!textarea) return;
  var evidenceId = textarea.getAttribute("data-evidence-id");
  var text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  var preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = text;
}

export function init() {
  populateEvidenceDropdowns();
  renderEvidenceList();

  // Attach event listeners
  document.getElementById("evidenceSearch").addEventListener("input", handleSearchInput);
  document.getElementById("filterType").addEventListener("change", renderEvidenceList);
  document.getElementById("filterPerson").addEventListener("change", renderEvidenceList);
  document.getElementById("filterLocation").addEventListener("change", renderEvidenceList);
  document.getElementById("filterStatus").addEventListener("change", renderEvidenceList);
  document.getElementById("filterRelevance").addEventListener("change", renderEvidenceList);
  document.getElementById("clearFiltersBtn").addEventListener("click", clearFilters);
  document.getElementById("sortEvidence").addEventListener("change", handleSortChange);

  var listContainer = document.getElementById("evidenceList");
  listContainer.removeEventListener("click", handleEvidenceListClick);
  listContainer.addEventListener("click", handleEvidenceListClick);
}