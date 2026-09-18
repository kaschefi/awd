import { state } from '../../state.js';
import type { Person } from '../../types.js';

export function switchPeopleTab(tab: 'people' | 'locations'): void {
  state.currentPeopleTab = tab;
  const peoplePanel = document.getElementById('peoplePanel');
  const locationsPanel = document.getElementById('locationsPanel');
  const peopleTabBtn = document.getElementById('tabPeopleBtn');
  const locationsTabBtn = document.getElementById('tabLocationsBtn');

  if (!peoplePanel || !locationsPanel || !peopleTabBtn || !locationsTabBtn) return;

  if (tab === 'people') {
    peoplePanel.classList.remove('hidden');
    locationsPanel.classList.add('hidden');
    peopleTabBtn.classList.add('active');
    locationsTabBtn.classList.remove('active');
  } else {
    peoplePanel.classList.add('hidden');
    locationsPanel.classList.remove('hidden');
    peopleTabBtn.classList.remove('active');
    locationsTabBtn.classList.add('active');
  }
}

declare global {
  interface Window {
    switchPeopleTab?: (tab: 'people' | 'locations') => void;
  }
}
window.switchPeopleTab = switchPeopleTab;

function countEvidenceForPerson(person: Person): number {
  let count = 0;
  for (let i = 0; i < state.allEvidence.length; i++) {
    const ev = state.allEvidence[i];
    if (
      ev &&
      ev.personIds &&
      (ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1)
    ) {
      count++;
    }
  }
  return count;
}

export function renderPeople(): void {
  const container = document.getElementById('peoplePanel');
  if (!container) return;
  let html = '';
  for (let i = 0; i < state.allPeople.length; i++) {
    const person = state.allPeople[i];
    if (!person) continue;
    const avatarSrc = './' + person.avatar.replace(/^\//, '').replace(/\.png$/i, '.webp');
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html +=
      '<img class="person-avatar" src="' + avatarSrc + '" alt="Portrait of ' + person.name + '">';
    html +=
      '<div><h3>' + person.name + '</h3><div class="person-role">' + person.role + '</div></div>';
    html += '</div>';
    html += '<p><strong>Speciality:</strong> ' + person.speciality + '</p>';
    html += '<ul>';
    for (let r = 0; r < person.responsibilities.length; r++) {
      html += '<li>' + person.responsibilities[r] + '</li>';
    }
    html += '</ul>';
    html += '<div class="person-statement">&ldquo;' + person.statement + '&rdquo;</div>';
    html += '<p>' + count + ' related evidence item' + (count === 1 ? '' : 's') + ' &mdash; ';
    html +=
      '<button type="button" class="evidence-count-link" data-person-id="' +
      person.id +
      '">view</button></p>';
    html += '</div>';
  }
  container.innerHTML = html;

  const links = container.querySelectorAll<HTMLButtonElement>('.evidence-count-link');
  for (let l = 0; l < links.length; l++) {
    const link = links[l];
    if (!link) continue;
    link.addEventListener('click', function (e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const personId = target ? target.getAttribute('data-person-id') : null;
      window.location.hash = 'evidence';
      setTimeout(function () {
        const filterEl = document.getElementById('filterPerson') as HTMLSelectElement | null;
        if (filterEl && personId) {
          filterEl.value = personId;
          filterEl.dispatchEvent(new Event('change'));
        }
      }, 50);
    });
  }
}

export function renderLocations(): void {
  const container = document.getElementById('locationsPanel');
  if (!container) return;

  let html = '';
  for (let i = 0; i < state.allLocations.length; i++) {
    const loc = state.allLocations[i];
    if (!loc) continue;
    html += '<div class="location-card">';
    html += '<h3>' + loc.id + ' &mdash; ' + loc.name + '</h3>';
    html += '<p>' + loc.description + '</p>';
    html += '<p><strong>Contains:</strong></p><ul>';
    for (let c = 0; c < loc.contains.length; c++) {
      html += '<li>' + loc.contains[c] + '</li>';
    }
    html += '</ul></div>';
  }
  container.innerHTML = html;
}

export function init(): void {
  renderPeople();
  renderLocations();
  switchPeopleTab(state.currentPeopleTab || 'people');

  document
    .getElementById('tabPeopleBtn')
    ?.addEventListener('click', () => switchPeopleTab('people'));
  document
    .getElementById('tabLocationsBtn')
    ?.addEventListener('click', () => switchPeopleTab('locations'));
}
