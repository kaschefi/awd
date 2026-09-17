import { state } from '../../state.js';
import type { TimelineEvent } from '../../types.js';
import {
  findLocationById,
  findEvidenceById,
  formatDate,
  certaintyBadgeClass,
} from '../../utils.js';

export function populateTimelineDropdowns(): void {
  const personSelect = document.getElementById('timelinePersonFilter') as HTMLSelectElement | null;
  const locationSelect = document.getElementById(
    'timelineLocationFilter'
  ) as HTMLSelectElement | null;
  const typeSelect = document.getElementById('timelineTypeFilter') as HTMLSelectElement | null;
  if (!personSelect || !locationSelect || !typeSelect) return;

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
      locationSelect.innerHTML += '<option value="' + loc.id + '">' + loc.id + '</option>';
    }
  }

  const types: string[] = [];
  for (let i = 0; i < state.allTimeline.length; i++) {
    const item = state.allTimeline[i];
    if (item && types.indexOf(item.type) === -1) types.push(item.type);
  }
  typeSelect.innerHTML = '<option value="">All event types</option>';
  for (let t = 0; t < types.length; t++) {
    const type = types[t];
    if (type) {
      typeSelect.innerHTML += '<option value="' + type + '">' + type + '</option>';
    }
  }
}

export function renderTimeline(): void {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  const orderSelect = document.getElementById('timelineOrder') as HTMLSelectElement | null;
  const personFilterSelect = document.getElementById(
    'timelinePersonFilter'
  ) as HTMLSelectElement | null;
  const locationFilterSelect = document.getElementById(
    'timelineLocationFilter'
  ) as HTMLSelectElement | null;
  const typeFilterSelect = document.getElementById(
    'timelineTypeFilter'
  ) as HTMLSelectElement | null;

  const order = orderSelect ? orderSelect.value : 'asc';
  const personFilter = personFilterSelect ? personFilterSelect.value : '';
  const locationFilter = locationFilterSelect ? locationFilterSelect.value : '';
  const typeFilter = typeFilterSelect ? typeFilterSelect.value : '';

  let events: TimelineEvent[] = [];
  for (let i = 0; i < state.allTimeline.length; i++) {
    const evt = state.allTimeline[i];
    if (!evt) continue;
    if (personFilter && evt.personIds.indexOf(personFilter) === -1) continue;
    if (locationFilter && evt.locationIds.indexOf(locationFilter) === -1) continue;
    if (typeFilter && evt.type !== typeFilter) continue;
    events.push(evt);
  }

  events = events.slice().sort(function (a, b) {
    const diff = new Date(a.time).getTime() - new Date(b.time).getTime();
    return order === 'desc' ? -diff : diff;
  });

  let html = '';
  for (let e = 0; e < events.length; e++) {
    const item = events[e];
    if (!item) continue;
    html += '<div class="timeline-event certainty-' + item.certainty + '">';
    html +=
      '<div class="timeline-time">' +
      formatDate(item.time) +
      '&nbsp;&middot;&nbsp;<span class="badge badge-' +
      certaintyBadgeClass(item.certainty) +
      '">' +
      item.certainty +
      '</span></div>';
    html += '<h3>' + item.title + '</h3>';
    html += '<p>' + item.description + '</p>';

    const eventLocationNames: string[] = [];
    for (let el = 0; el < item.locationIds.length; el++) {
      const locId = item.locationIds[el];
      if (!locId) continue;
      const evtLoc = findLocationById(locId);
      eventLocationNames.push(evtLoc ? evtLoc.id + ' - ' + evtLoc.name : locId);
    }
    if (eventLocationNames.length > 0) {
      html += '<p class="evidence-meta">Location: ' + eventLocationNames.join(', ') + '</p>';
    }

    for (let ev2 = 0; ev2 < item.evidenceIds.length; ev2++) {
      const evId = item.evidenceIds[ev2];
      if (!evId) continue;
      html +=
        '<button type="button" class="evidence-link-btn" data-evidence-id="' +
        evId +
        '">View ' +
        evId +
        '</button>';
    }
    html += '</div>';
  }
  if (events.length === 0) {
    html = '<p>No timeline events match the current filters.</p>';
  }
  container.innerHTML = html;

  const linkButtons = container.querySelectorAll<HTMLButtonElement>('.evidence-link-btn');
  for (let b = 0; b < linkButtons.length; b++) {
    const btn = linkButtons[b];
    if (!btn) continue;
    btn.addEventListener('click', function (e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const evId = target ? target.getAttribute('data-evidence-id') : null;
      if (evId) {
        openEvidenceModal(evId);
      }
    });
  }
}

function openEvidenceModal(evidenceId: string): void {
  const ev = findEvidenceById(evidenceId);
  if (!ev) return;

  let modal = document.getElementById('quickViewModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quickViewModal';
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    '<div class="modal-backdrop"><div class="modal-box">' +
    '<button type="button" class="modal-close-btn" aria-label="Close">&times;</button>' +
    '<h3>' +
    ev.title +
    '</h3>' +
    '<p class="evidence-meta">' +
    ev.id +
    ' &middot; ' +
    ev.type +
    ' &middot; ' +
    formatDate(ev.timestamp) +
    '</p>' +
    '<p>' +
    ev.summary +
    '</p>' +
    '<button type="button" class="btn btn-primary btn-small" data-open-full="' +
    ev.id +
    '">Open full evidence</button>' +
    '</div></div>';

  // Bug (Demo 4): modalCloseListenerCount increments every time the modal is
  // opened but the listener added below is NEVER removed. Repeated opens stack
  // listeners, which is only visible in the console log below.
  state.modalCloseListenerCount = 1;
  console.log('modal opened, active close listeners:', state.modalCloseListenerCount);

  modal.onclick = function (e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target || !modal) return;
    if (
      target.classList.contains('modal-close-btn') ||
      target.classList.contains('modal-backdrop')
    ) {
      modal.innerHTML = '';
    }
    if (target.getAttribute && target.getAttribute('data-open-full')) {
      modal.innerHTML = '';
      window.location.hash = 'evidence';
      setTimeout(function () {
        import('./script.js').then(function () {
          window.location.hash = 'evidence';
        });
      }, 50);
    }
  };
}

export function init(): void {
  populateTimelineDropdowns();
  renderTimeline();

  document.getElementById('timelineOrder')?.addEventListener('change', renderTimeline);
  document.getElementById('timelinePersonFilter')?.addEventListener('change', renderTimeline);
  document.getElementById('timelineLocationFilter')?.addEventListener('change', renderTimeline);
  document.getElementById('timelineTypeFilter')?.addEventListener('change', renderTimeline);
}
