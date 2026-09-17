import { state, STORAGE_KEY_HYPOTHESIS } from '../../state.js';

export function populateHypothesisDropdowns(): void {
  const suspectSelect = document.getElementById('hypSuspect') as HTMLSelectElement | null;
  const evidenceSelect = document.getElementById('hypEvidence') as HTMLSelectElement | null;
  if (!suspectSelect || !evidenceSelect) return;

  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (let p = 0; p < state.allPeople.length; p++) {
    const person = state.allPeople[p];
    if (person) {
      suspectSelect.innerHTML += '<option value="' + person.id + '">' + person.name + '</option>';
    }
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = '';
  for (let i = 0; i < state.allEvidence.length; i++) {
    const ev = state.allEvidence[i];
    if (ev) {
      evidenceSelect.innerHTML +=
        '<option value="' + ev.id + '">' + ev.id + ' - ' + ev.title + '</option>';
    }
  }
}

export function renderBookmarksList(): void {
  const container = document.getElementById('bookmarksList');
  if (!container) return;

  const bookmarkedItems = state.allEvidence.filter(function (ev) {
    return Boolean(ev.bookmarked);
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      '<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>';
    return;
  }

  let html = '';
  for (let i = 0; i < bookmarkedItems.length; i++) {
    const ev = bookmarkedItems[i];
    if (!ev) continue;
    html +=
      '<div class="mini-list-item"><strong>' +
      ev.id +
      '</strong> &mdash; ' +
      ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' +
      ev.id +
      '">Open</button></div>';
  }
  container.innerHTML = html;

  const openButtons = container.querySelectorAll<HTMLButtonElement>('[data-open-evidence]');
  for (let b = 0; b < openButtons.length; b++) {
    const btn = openButtons[b];
    if (!btn) continue;
    btn.addEventListener('click', function (e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const id = target ? target.getAttribute('data-open-evidence') : null;
      if (!id) return;
      window.location.hash = 'evidence';
      setTimeout(function () {
        import('../evidence/script.js').then(
          (module: { openEvidenceDetail: (id: string) => void }) => {
            module.openEvidenceDetail(id);
          }
        );
      }, 50);
    });
  }
}

interface NoteEntry {
  index: number;
  evidenceId: string;
  title: string;
  text: string;
}

export function renderNotesList(): void {
  const container = document.getElementById('notesList');
  if (!container) return;

  const noteEntries: NoteEntry[] = [];
  for (let i = 0; i < state.allEvidence.length; i++) {
    const ev = state.allEvidence[i];
    if (!ev) continue;
    const note = state.notesStore[ev.id];
    if (note) {
      noteEntries.push({
        index: i,
        evidenceId: ev.id,
        title: ev.title,
        text: note,
      });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  let html = '';
  for (let n = 0; n < noteEntries.length; n++) {
    const entry = noteEntries[n];
    if (!entry) continue;
    html +=
      '<div class="mini-list-item"><strong>' +
      entry.evidenceId +
      '</strong> &mdash; ' +
      entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + '</div></div>';
  }
  container.innerHTML = html;
}

function getSelectedOptions(selectEl: HTMLSelectElement): string[] {
  const result: string[] = [];
  for (let i = 0; i < selectEl.options.length; i++) {
    const opt = selectEl.options[i];
    if (opt && opt.selected) result.push(opt.value);
  }
  return result;
}

export function saveHypothesis(): void {
  const suspectEl = document.getElementById('hypSuspect') as HTMLSelectElement | null;
  const natureEl = document.getElementById('hypNature') as HTMLSelectElement | null;
  const evidenceEl = document.getElementById('hypEvidence') as HTMLSelectElement | null;
  const confidenceEl = document.getElementById('hypConfidence') as HTMLInputElement | null;
  const explanationEl = document.getElementById('hypExplanation') as HTMLTextAreaElement | null;
  const alternativeEl = document.getElementById('hypAlternative') as HTMLTextAreaElement | null;

  if (!suspectEl || !natureEl || !evidenceEl || !confidenceEl || !explanationEl || !alternativeEl) {
    return;
  }

  const draft = {
    suspectId: suspectEl.value,
    nature: natureEl.value,
    evidenceIds: getSelectedOptions(evidenceEl),
    confidence: confidenceEl.value,
    explanation: explanationEl.value,
    alternative: alternativeEl.value,
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error('Could not save hypothesis draft', err);
    alert('Your hypothesis could not be saved to local storage.');
    return;
  }

  const msg = document.getElementById('hypothesisSavedMsg');
  if (msg) {
    msg.classList.remove('hidden');
    setTimeout(function () {
      msg.classList.add('hidden');
    }, 2000);
  }
}

declare global {
  interface Window {
    saveHypothesis?: () => void;
  }
}
window.saveHypothesis = saveHypothesis;

interface SavedHypothesisDraft {
  suspectId?: string;
  nature?: string;
  evidenceIds?: string[];
  confidence?: number | string;
  explanation?: string;
  alternative?: string;
}

export function loadHypothesisFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;
  const draft: SavedHypothesisDraft = JSON.parse(raw);

  const suspectEl = document.getElementById('hypSuspect') as HTMLSelectElement | null;
  const natureEl = document.getElementById('hypNature') as HTMLSelectElement | null;
  const confidenceEl = document.getElementById('hypConfidence') as HTMLInputElement | null;
  const confidenceValEl = document.getElementById('hypConfidenceValue');
  const explanationEl = document.getElementById('hypExplanation') as HTMLTextAreaElement | null;
  const alternativeEl = document.getElementById('hypAlternative') as HTMLTextAreaElement | null;

  if (suspectEl) suspectEl.value = draft.suspectId || '';
  if (natureEl) natureEl.value = draft.nature || '';
  if (confidenceEl) confidenceEl.value = String(draft.confidence || 50);
  if (confidenceValEl) confidenceValEl.textContent = String(draft.confidence || 50);
  if (explanationEl) explanationEl.value = draft.explanation || '';
  if (alternativeEl) alternativeEl.value = draft.alternative || '';

  const evidenceSelect = document.getElementById('hypEvidence') as HTMLSelectElement | null;
  if (evidenceSelect) {
    const savedIds = draft.evidenceIds || [];
    for (let i = 0; i < evidenceSelect.options.length; i++) {
      const opt = evidenceSelect.options[i];
      if (opt) {
        opt.selected = savedIds.indexOf(opt.value) !== -1;
      }
    }
  }
}

export function init(): void {
  populateHypothesisDropdowns();
  renderBookmarksList();
  renderNotesList();
  loadHypothesisFromStorage();

  const confInput = document.getElementById('hypConfidence') as HTMLInputElement | null;
  if (confInput) {
    confInput.addEventListener('input', function (e: Event) {
      const target = e.target as HTMLInputElement | null;
      const display = document.getElementById('hypConfidenceValue');
      if (display && target) {
        display.textContent = target.value;
      }
    });
  }

  const saveBtn = document.querySelector('#hypothesisForm .btn-primary');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveHypothesis);
  }
}
