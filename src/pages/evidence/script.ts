import {
  state,
  saveBookmarksToStorage,
  saveNoteForEvidence,
  loadNoteForEvidence,
} from '../../state.js';
import type { Evidence, EvidenceStatus, EvidenceRelevance } from '../../types.js';
import {
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
} from '../../utils.js';

let latestSearchRequestId = 0;

export function populateEvidenceDropdowns(): void {
  const typeSelect = document.getElementById('filterType') as HTMLSelectElement | null;
  const personSelect = document.getElementById('filterPerson') as HTMLSelectElement | null;
  const locationSelect = document.getElementById('filterLocation') as HTMLSelectElement | null;
  if (!typeSelect || !personSelect || !locationSelect) return;

  const types: string[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const item = state.allEvidence[i];
    if (!item) continue;
    const t = item.type.toLowerCase();
    if (types.indexOf(t) === -1) types.push(t);
  }
  typeSelect.innerHTML = '<option value="">All types</option>';
  for (let ti = 0; ti < types.length; ti++) {
    const t = types[ti];
    if (t) {
      typeSelect.innerHTML += '<option value="' + t + '">' + t + '</option>';
    }
  }

  personSelect.innerHTML = '<option value="">All people</option>';
  for (let p = 0; p < state.allPeople.length; p++) {
    const person = state.allPeople[p];
    if (person) {
      personSelect.innerHTML += '<option value="' + person.id + '">' + person.name + '</option>';
    }
  }

  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (let l = 0; l < state.allLocations.length; l++) {
    const loc = state.allLocations[l];
    if (loc) {
      locationSelect.innerHTML +=
        '<option value="' + loc.id + '">' + loc.id + ' - ' + loc.name + '</option>';
    }
  }
}

export function getFilteredEvidence(): Evidence[] {
  const searchBox = document.getElementById('evidenceSearch') as HTMLInputElement | null;
  const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : '';

  const typeEl = document.getElementById('filterType') as HTMLSelectElement | null;
  const personEl = document.getElementById('filterPerson') as HTMLSelectElement | null;
  const locationEl = document.getElementById('filterLocation') as HTMLSelectElement | null;
  const statusEl = document.getElementById('filterStatus') as HTMLSelectElement | null;
  const relevanceEl = document.getElementById('filterRelevance') as HTMLSelectElement | null;

  const typeVal = typeEl ? typeEl.value : '';
  const personVal = personEl ? personEl.value : '';
  const locationVal = locationEl ? locationEl.value : '';
  const statusVal = statusEl ? statusEl.value : '';
  const relevanceVal = relevanceEl ? relevanceEl.value : '';

  const results: Evidence[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const item = state.allEvidence[i];
    if (!item) continue;
    let matches = true;

    if (searchTerm) {
      const haystack = (item.title + ' ' + item.summary + ' ' + item.tags.join(' ')).toLowerCase();
      if (haystack.indexOf(searchTerm) === -1) matches = false;
    }
    if (matches && typeVal && item.type.toLowerCase() !== typeVal) matches = false;
    if (matches && personVal) {
      const person = findPersonById(personVal);
      if (!person || !evidenceMentionsPerson(item, person)) matches = false;
    }
    if (matches && locationVal && item.locationIds.indexOf(locationVal) === -1) matches = false;
    if (matches && statusVal && (item.status || '').toLowerCase() !== statusVal) matches = false;
    if (matches && relevanceVal && (item.relevance || '').toLowerCase() !== relevanceVal)
      matches = false;

    if (matches) results.push(item);
  }

  // Apply current sort order
  const sortEl = document.getElementById('sortEvidence') as HTMLSelectElement | null;
  const sortValue = sortEl ? sortEl.value : 'date-desc';

  if (sortValue === 'title-asc') {
    results.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortValue === 'title-desc') {
    results.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortValue === 'date-asc') {
    results.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  } else {
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  state.filteredEvidence = results;
  return results;
}

export function renderEvidenceList(): void {
  const container = document.getElementById('evidenceList');
  if (!container) return;

  const loadingIndicator = document.getElementById('evidenceLoadingIndicator');
  if (state.evidenceViewLoading) {
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    container.innerHTML = '';
    return;
  }
  if (loadingIndicator) loadingIndicator.classList.add('hidden');

  const results = getFilteredEvidence();

  let html = '';
  if (results.length === 0) {
    html = '<p>No evidence matches the current filters.</p>';
  }
  for (let i = 0; i < results.length; i++) {
    const item = results[i];
    if (item) {
      html += renderEvidenceCardHTML(item);
    }
  }
  container.innerHTML = html;
}

function renderEvidenceCardHTML(ev: Evidence): string {
  const isBookmarked = state.bookmarks.indexOf(ev.id) !== -1;
  let html = '<div class="evidence-card" data-id="' + ev.id + '">';
  html +=
    '<button class="bookmark-btn ' +
    (isBookmarked ? 'active' : '') +
    '" data-action="bookmark" data-id="' +
    ev.id +
    '" aria-label="Toggle bookmark for ' +
    ev.title +
    '"><span class="bookmark-icon">' +
    (isBookmarked ? '★' : '☆') +
    '</span></button>';
  html += '<h3>' + ev.title + '</h3>';
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    ' &middot; ' +
    ev.type +
    ' &middot; ' +
    formatDate(ev.timestamp) +
    '</div>';
  html += '<div class="evidence-summary">' + ev.summary + '</div>';

  if (ev.tags.indexOf('critical') !== -1) {
    html += '<span class="badge badge-critical">Critical</span>';
  }
  html += '<span class="badge ' + getStatusBadgeClass(ev.status) + '">' + ev.status + '</span>';
  html +=
    '<span class="badge ' + getRelevanceBadgeClass(ev.relevance) + '">' + ev.relevance + '</span>';
  html += '<div>';
  for (let t = 0; t < ev.tags.length; t++) {
    html += '<span class="tag-chip">' + ev.tags[t] + '</span>';
  }
  html += '</div>';
  html += '</div>';
  return html;
}

function handleEvidenceListClick(event: MouseEvent): void {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  if (target.dataset && target.dataset.action === 'bookmark') {
    event.stopPropagation();
    const targetId = target.dataset.id;
    if (targetId) {
      handleBookmarkClick(targetId);
    }
    return;
  }

  const card = target.closest('.evidence-card');
  if (card) {
    const cardId = card.getAttribute('data-id');
    if (cardId) {
      openEvidenceDetail(cardId);
    }
  }
}

function handleBookmarkClick(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
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

export function handleSortChange(): void {
  renderEvidenceList();
}

function clearFilters(): void {
  const searchBox = document.getElementById('evidenceSearch') as HTMLInputElement | null;
  const typeSelect = document.getElementById('filterType') as HTMLSelectElement | null;
  const personSelect = document.getElementById('filterPerson') as HTMLSelectElement | null;
  const locationSelect = document.getElementById('filterLocation') as HTMLSelectElement | null;
  const statusSelect = document.getElementById('filterStatus') as HTMLSelectElement | null;
  const relevanceSelect = document.getElementById('filterRelevance') as HTMLSelectElement | null;

  if (searchBox) searchBox.value = '';
  if (typeSelect) typeSelect.value = '';
  if (personSelect) personSelect.value = '';
  if (locationSelect) locationSelect.value = '';
  if (statusSelect) statusSelect.value = '';
  if (relevanceSelect) relevanceSelect.value = '';

  renderEvidenceList();
}

function handleSearchInput(): void {
  const requestId = ++latestSearchRequestId;

  setTimeout(function () {
    if (requestId !== latestSearchRequestId) return;
    renderEvidenceList();
  }, 300);
}

export function openEvidenceDetail(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;
  state.selectedEvidence = ev;

  const section = document.getElementById('evidenceDetailSection');
  if (!section) return;
  section.classList.remove('hidden');

  renderEvidenceDetail(ev);
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function closeEvidenceDetail(): void {
  const section = document.getElementById('evidenceDetailSection');
  if (!section) return;
  section.classList.add('hidden');
  section.innerHTML = '';
  state.selectedEvidence = null;
}

function renderEvidenceDetail(ev: Evidence): void {
  const section = document.getElementById('evidenceDetailSection');
  if (!section) return;

  const personNames: string[] = [];
  for (let p = 0; p < ev.personIds.length; p++) {
    const pId = ev.personIds[p];
    if (!pId) continue;
    const person = findPersonById(pId);
    personNames.push(person ? person.name : pId);
  }

  const locationNames: string[] = [];
  for (let l = 0; l < ev.locationIds.length; l++) {
    const lId = ev.locationIds[l];
    if (!lId) continue;
    const loc = findLocationById(lId);
    locationNames.push(loc ? loc.id + ' - ' + loc.name : lId);
  }

  let tagsHtml = '';
  for (let t = 0; t < ev.tags.length; t++) {
    tagsHtml += '<span class="tag-chip">' + ev.tags[t] + '</span>';
  }

  const storedNote = loadNoteForEvidence(ev.id);

  let html = '';
  html += '<div class="evidence-detail-header">';
  html += '<div><h2>' + ev.title + '</h2>';
  html +=
    '<div class="evidence-meta">' +
    ev.id +
    ' &middot; ' +
    ev.type +
    ' &middot; ' +
    formatDate(ev.timestamp) +
    '</div></div>';
  html +=
    '<button type="button" id="closeDetailBtn" class="btn btn-secondary btn-small">Close</button>';
  html += '</div>';

  if (ev.tags.indexOf('critical') !== -1) {
    html += '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  }

  html += '<div class="detail-field"><strong>Summary</strong>' + ev.summary + '</div>';
  html += '<div class="evidence-detail-content">' + ev.content + '</div>';
  html +=
    '<div class="detail-field"><strong>Related people</strong>' + personNames.join(', ') + '</div>';
  html +=
    '<div class="detail-field"><strong>Related locations</strong>' +
    locationNames.join(', ') +
    '</div>';
  html += '<div class="detail-field"><strong>Tags</strong>' + tagsHtml + '</div>';

  html += '<div class="detail-field"><strong>Review status</strong>';
  html += '<select id="detailStatusSelect">';
  html += statusOptionHTML(ev.status, 'unreviewed', 'Unreviewed');
  html += statusOptionHTML(ev.status, 'reviewed', 'Reviewed');
  html += statusOptionHTML(ev.status, 'flagged', 'Flagged');
  html += '</select></div>';

  html += '<div class="detail-field"><strong>Relevance</strong>';
  html += '<select id="detailRelevanceSelect">';
  html += statusOptionHTML(ev.relevance, 'unknown', 'Unknown');
  html += statusOptionHTML(ev.relevance, 'relevant', 'Relevant');
  html += statusOptionHTML(ev.relevance, 'irrelevant', 'Irrelevant');
  html += '</select></div>';

  html += '<div class="detail-field"><strong>Investigator note</strong>';
  html +=
    '<textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="' +
    ev.id +
    '" placeholder="Add a private note about this evidence...">' +
    storedNote +
    '</textarea>';
  html +=
    '<button type="button" id="saveNoteBtn" class="btn btn-primary btn-small" style="margin-top:6px;">Save note</button>';
  html += '</div>';

  html +=
    '<div class="detail-field"><strong>Note preview</strong><div id="notePreview">' +
    storedNote +
    '</div></div>';

  section.innerHTML = html;

  document.getElementById('closeDetailBtn')?.addEventListener('click', closeEvidenceDetail);
  document.getElementById('saveNoteBtn')?.addEventListener('click', saveCurrentNote);

  document.getElementById('detailStatusSelect')?.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement | null;
    if (target) {
      ev.status = target.value as EvidenceStatus;
      renderEvidenceDetail(ev);
      renderEvidenceList();
    }
  });
  document.getElementById('detailRelevanceSelect')?.addEventListener('change', (e: Event) => {
    const target = e.target as HTMLSelectElement | null;
    if (target) {
      ev.relevance = target.value as EvidenceRelevance;
      renderEvidenceDetail(ev);
      renderEvidenceList();
    }
  });
}

function statusOptionHTML(current: string | undefined, value: string, label: string): string {
  const currentLower = (current || '').toLowerCase();
  const selected = currentLower === value ? ' selected' : '';
  return '<option value="' + value + '"' + selected + '>' + label + '</option>';
}

function saveCurrentNote(): void {
  const textarea = document.getElementById('evidenceNoteInput') as HTMLTextAreaElement | null;
  if (!textarea) return;
  const evidenceId = textarea.getAttribute('data-evidence-id');
  if (!evidenceId) return;
  const text = textarea.value;
  saveNoteForEvidence(evidenceId, text);
  const preview = document.getElementById('notePreview');
  if (preview) preview.textContent = text;
}

export function init(): void {
  populateEvidenceDropdowns();
  renderEvidenceList();

  // Attach event listeners
  document.getElementById('evidenceSearch')?.addEventListener('input', handleSearchInput);
  document.getElementById('filterType')?.addEventListener('change', renderEvidenceList);
  document.getElementById('filterPerson')?.addEventListener('change', renderEvidenceList);
  document.getElementById('filterLocation')?.addEventListener('change', renderEvidenceList);
  document.getElementById('filterStatus')?.addEventListener('change', renderEvidenceList);
  document.getElementById('filterRelevance')?.addEventListener('change', renderEvidenceList);
  document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
  document.getElementById('sortEvidence')?.addEventListener('change', handleSortChange);

  const listContainer = document.getElementById('evidenceList');
  if (listContainer) {
    listContainer.removeEventListener('click', handleEvidenceListClick as EventListener);
    listContainer.addEventListener('click', handleEvidenceListClick as EventListener);
  }
}
