# Exercise 5 — React Interactivity, State & Reactive Programming

## Self-Check Table

| # | Demo | Description | Status |
|---|---|---|---|
| 1 | Migrate event handling from vanilla listeners | Static React structure for Evidence & Workspace, migrating inline/vanilla event handlers to JSX synthetic events | Ready |
| 2 | `useState` & controlled forms | Controlled search box, controlled hypothesis form (inputs, selects, multi-select, range, textareas), draft persistence | Ready |
| 3 | Immutable updates | Strict non-mutating state transitions, immutable bookmark toggle, preventing master array corruption | Ready |
| 4 | Derived values vs. stored state | In-render computation of filtered & sorted evidence, dynamic bookmark counters, single source of truth | Ready |
| 5 | Lifting state to the nearest common owner | Identify common ancestor component for shared bookmark state across Dashboard, Evidence, and Workspace | ☐ |
| 6 | Passing callbacks downward | Unidirectional data flow via downward callbacks (`onToggleBookmark`, `onSaveNote`, `onStatusChange`), prop drilling analysis | ☐ |
| 7 | `useReducer` for filter/search/sort state | Consolidate 7+ interrelated filter controls into a unified state domain with discrete action types | ☐ |
| 8 | Context, and when not to use it | React Context for cross-cutting bookmark state vs. prop-drilling evaluation, global state trade-offs | ☐ |
| 9 | Diagnose & fix common state problems | Audit for duplicated state, stale state, excessive prop drilling, unnecessary global state, and mutations | ☐ |
| 10 | Remove remaining direct DOM manipulation + wrap-up | Elimination of `querySelector`, manual `classList`, and `innerHTML`; end-to-end declarative React app | ☐ |

---

## Demo 1 — Migrate event handling from vanilla listeners

### Tasks

#### 1. Built Evidence Catalogue and Workspace Static Structure in React
We constructed the full component trees for the final two views and replaced the `<StubView />` placeholders in [src/ReactApp.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/ReactApp.tsx):

1. **Evidence Catalogue Components (`src/components/evidence/`)**:
   - [EvidenceCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceCard.tsx): Displays individual evidence cards with metadata, formatted timestamp, tags, critical banner, review badges, and interactive bookmark button.
   - [EvidenceToolbar.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceToolbar.tsx): Search input, multi-faceted filter dropdowns (type, person, location, status, relevance), sorting selector, and "Clear filters" button.
   - [EvidenceList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceList.tsx): Grid container rendering cards, handling empty search results, and displaying loading spinners.
   - [EvidenceDetailModal.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceDetailModal.tsx): Full inspector displaying linked personnel, linked locations, review status dropdown, relevance dropdown, investigator note textarea, and save note button.
   - [EvidenceView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceView.tsx): Main view coordinating toolbar filters, evidence list, and modal inspection.

2. **Investigator Workspace Components (`src/components/workspace/`)**:
   - [BookmarkedEvidenceList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/BookmarkedEvidenceList.tsx): Displays currently bookmarked evidence items with direct "Open" buttons.
   - [NotesList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/NotesList.tsx): Displays saved notes linked to evidence items with "Open" buttons.
   - [HypothesisForm.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/HypothesisForm.tsx): Controlled formulation draft form (suspect select, nature select, supporting evidence multi-select, confidence range slider + value display, explanation textarea, alternative textarea, and save button).
   - [WorkspaceView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/WorkspaceView.tsx): Main workspace layout containing bookmarks, notes, and the hypothesis form.

---

#### 2. Migrated Real Event Handlers from Vanilla to React

We migrated multiple real event handlers, replacing DOM-bound listeners and string attributes with React synthetic event handlers:

1. **Bookmark Click Handler**:
   - *Vanilla Version:* In `src/pages/evidence/script.ts`, cards were rendered as HTML strings with `<button data-action="bookmark" data-id="...">`. A delegated listener was attached to `#evidenceList`, which inspected `event.target.closest('[data-action="bookmark"]')`.
   - *React Version:* Replaced with declarative JSX `onClick` in [EvidenceCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceCard.tsx):
     ```tsx
     const handleBookmarkClick = (e: React.MouseEvent<HTMLButtonElement>) => {
       e.stopPropagation();
       onToggleBookmark(evidence.id);
     };

     <button
       type="button"
       className={`bookmark-btn ${isBookmarked ? 'active' : ''}`}
       onClick={handleBookmarkClick}
       aria-label={`Toggle bookmark for ${evidence.title}`}
     >
       <span className="bookmark-icon">{isBookmarked ? '★' : '☆'}</span>
     </button>
     ```

2. **Search Input Handler**:
   - *Vanilla Version:* In `src/pages/evidence/script.ts`, manually attached via `document.getElementById('evidenceSearch')?.addEventListener('input', handleSearchInput)`.
   - *React Version:* Co-located directly on the input in [EvidenceToolbar.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceToolbar.tsx) using `onChange`:
     ```tsx
     <input
       type="text"
       id="evidenceSearch"
       placeholder="Search evidence by title, summary, or tag…"
       autoComplete="off"
       value={searchTerm}
       onChange={(e) => onSearchChange(e.target.value)}
     />
     ```

3. **Save Hypothesis Draft Handler**:
   - *Vanilla Version:* In `src/pages/workspace/index.html`, used inline HTML attribute `<button onclick="saveHypothesis()">` and `saveBtn.addEventListener('click', saveHypothesis)` in `script.ts`.
   - *React Version:* Handled cleanly via React's form submission in [HypothesisForm.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/HypothesisForm.tsx):
     ```tsx
     <form id="hypothesisForm" onSubmit={handleSaveHypothesis}>
       ...
       <button type="submit" className="btn btn-primary">
         Save hypothesis draft
       </button>
     </form>
     ```

4. **Save Note & Close Detail Handlers**:
   - *Vanilla Version:* In `src/pages/evidence/script.ts`, attached manually via `closeDetailBtn.addEventListener('click', closeEvidenceDetail)` and `saveNoteBtn.addEventListener('click', saveCurrentNote)`.
   - *React Version:* Replaced with React `onClick={onClose}` and `onClick={handleSave}` in [EvidenceDetailModal.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceDetailModal.tsx).

---

#### 3. Confirmation: Vanilla Listeners and Inline Attributes Removed
In the newly mounted React views:
- Zero inline `onclick="..."` HTML attributes exist.
- Zero manual `document.getElementById(...).addEventListener(...)` calls exist.
- React maintains ownership of all event dispatching, binding, and cleanup through Virtual DOM reconciliation.

---

### Questions

#### 1. How do you attach a click handler to a button in React versus how the vanilla version did it (inline `onclick="..."` in the HTML string, or `addEventListener` in JS)? What actually receives the event object in each approach, and is it the same kind of object?

##### Attachment Mechanisms
- **Vanilla Inline HTML (`onclick="saveHypothesis()"`):**
  - Specified as a string attribute directly in the HTML template.
  - The browser executes the string by evaluating it in the global `window` scope when triggered.
  - It creates hard dependencies on global functions and breaks lexical scoping and encapsulation.
- **Vanilla DOM API (`element.addEventListener('click', handler)`):**
  - Imperatively attached in JavaScript after DOM nodes have already been mounted in the document.
  - Requires looking up elements via DOM selectors (`document.getElementById`).
  - If elements are re-rendered by updating `innerHTML`, old listeners are lost and new listeners must be re-attached manually, risking memory leaks if not cleaned up.
- **React (`<button onClick={handleClick}>`):**
  - Passed declaratively in JSX as an actual JavaScript function reference.
  - Handled by React's synthetic event system. Event handlers are co-located directly with component markup.

##### What Receives the Event Object & Event Object Comparison
- **In Vanilla JS:**
  - The handler receives a native browser **`MouseEvent`** (or `PointerEvent`), dispatched directly by the browser's DOM element.
  - Its properties and behavior can vary slightly between browser engines (e.g., event bubbling details, normalized buttons).
- **In React:**
  - The handler receives a **`SyntheticEvent`** (specifically `React.MouseEvent<HTMLButtonElement>`).
  - It is **NOT** the same object: `SyntheticEvent` is React's cross-browser wrapper that wraps the native browser event.
  - It normalizes event properties (`target`, `currentTarget`, `preventDefault()`, `stopPropagation()`) so that behavior is completely identical across all browsers and operating systems.
  - The underlying native browser event remains accessible via `e.nativeEvent`.

---

#### 2. The vanilla version's evidence-list click handling used event delegation (one listener on the container, checking `event.target`) partly to work around listeners being re-registered on every render. Do you still need that pattern in React? Why or why not?

##### Why the Vanilla Version Required Event Delegation
In `src/pages/evidence/script.ts`, every time a user typed in the search box or changed a filter, `renderEvidenceList()` rebuilt the list by rewriting `container.innerHTML = htmlString`.
- If individual event listeners had been attached to each card or bookmark button, every render pass would destroy those DOM elements and discard the listeners.
- Re-attaching listeners after each render required traversing the DOM with `querySelectorAll`, creating performance overhead and risking detached listener memory leaks.
- Vanilla used event delegation on `#evidenceList` (`e.target.closest('.evidence-card')`) so that a single container listener could survive the destruction of child DOM elements.

##### Why Event Delegation Is Not Needed in React
**You do NOT need to write manual event delegation in React.**
1. **React Automatically Delegates at the Root:** React already implements event delegation under the hood. When you write `<button onClick={handleBookmark}>` on 50 evidence cards, React does not attach 50 individual native event listeners to DOM nodes. Instead, React attaches a single top-level event listener at the root container (`#root`) and dispatches incoming events to the appropriate component handlers by walking its internal fiber tree.
2. **Stable Reconciliation:** React does not destroy and recreate the DOM using `innerHTML`. It uses Virtual DOM diffing (reconciliation) to patch only modified DOM attributes and text nodes, preserving DOM node stability.
3. **Component Encapsulation:** In React, attaching `onClick` directly to `<EvidenceCard>` co-locates the behavior with the component. You write clean, direct handlers without writing fragile DOM-traversal code like `event.target.closest('[data-action="bookmark"]')`.

---

## Demo 2 — `useState` & controlled forms

### Tasks

#### 1. Evidence Search Box as a Controlled Input
In [src/components/evidence/EvidenceToolbar.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceToolbar.tsx), the search box is fully controlled via `value` and `onChange`:
```tsx
<input
  type="text"
  id="evidenceSearch"
  placeholder="Search evidence by title, summary, or tag…"
  autoComplete="off"
  value={searchTerm}
  onChange={(e) => onSearchChange(e.target.value)}
/>
```
The state is owned by [src/components/evidence/EvidenceView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceView.tsx):
```tsx
const [searchTerm, setSearchTerm] = useState('');
```
Every keystroke dispatches `setSearchTerm(e.target.value)`, synchronizing React state with the input and triggering real-time derived filtering of the evidence cards during render.

---

#### 2. Fully Controlled Hypothesis Form
In [src/components/workspace/HypothesisForm.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/HypothesisForm.tsx), all 6 diverse input fields are strictly controlled:
- **Suspect Dropdown (`<select>`):**
  `value={draft.suspect}` with `onChange={(e) => updateDraft('suspect', e.target.value)}`
- **Incident Nature Dropdown (`<select>`):**
  `value={draft.nature}` with `onChange={(e) => updateDraft('nature', e.target.value as ...)}`
- **Supporting Evidence Multi-Select (`<select multiple>`):**
  `value={draft.evidenceIds}` with `onChange={handleEvidenceSelectChange}`, reading `e.target.selectedOptions` to convert selections into an array of string IDs.
- **Confidence Range Slider (`<input type="range">`) & `<output>`:**
  `value={draft.confidence}` with `onChange={(e) => updateDraft('confidence', Number(e.target.value))}`, and the `<output id="hypConfidenceValue">{draft.confidence}</output>` bound synchronously to state.
- **Written Explanation (`<textarea>`):**
  `value={draft.explanation}` with `onChange={(e) => updateDraft('explanation', e.target.value)}`
- **Alternative Explanation (`<textarea>`):**
  `value={draft.alternative}` with `onChange={(e) => updateDraft('alternative', e.target.value)}`

---

#### 3. Draft Persistence to `localStorage` from Controlled State
In `HypothesisForm.tsx`, saving reads directly from the controlled `draft` state object and serializes it:
```tsx
const handleSaveHypothesis = (e: React.FormEvent) => {
  e.preventDefault();

  const storagePayload = {
    ...draft,
    suspectId: draft.suspect,
    savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(storagePayload));
  onSave?.(draft);

  setShowSavedMsg(true);
  setTimeout(() => setShowSavedMsg(false), 2000);
};
```
On initial component mount (`useEffect`), the draft is loaded from `localStorage` and hydrates the controlled state in one atomic `setDraft(...)` call, ensuring form inputs display the persisted data upon reload.

---

### Questions

#### 1. What makes an input "controlled" versus "uncontrolled" in React? Show what happens if you try to type in one of your controlled inputs without wiring its `onChange` and explain, in terms of React's render cycle, *why* that happens.

##### Controlled vs. Uncontrolled Inputs
- **Uncontrolled Input:**
  - The browser's native DOM node (`HTMLInputElement`) owns and mutates its own internal state (`input.value`).
  - React does not track changes on every keystroke. React only queries the DOM value when needed, typically via a `ref` (`inputRef.current.value`) or on form submission.
- **Controlled Input:**
  - React component state (`useState`) is the **single source of truth** for the input's current value.
  - The input is explicitly bound via `value={stateVariable}`.
  - Any user keystroke generates an event (`onChange`), which invokes a state setter (`setState(e.target.value)`).
  - The input visually updates only because React re-renders the component with the new state value.

##### What Happens Without `onChange`
If you provide a `value` prop without an `onChange` handler:
```tsx
<input type="text" value={searchTerm} /> // No onChange handler wired!
```
**Observable Result:** The input box is completely **frozen**. Typing on the keyboard produces no visible text whatsoever.

##### Why This Happens (In Terms of React's Render Cycle)
1. **Keystroke / Browser Input Event:** The user presses a key (e.g., `'K'`). The browser's native input element internally attempts to append `'K'` and dispatches a native `input` / `change` event.
2. **Missing State Transition:** Because no `onChange` handler is wired, no React state updater is called. React's state variable (`searchTerm`) remains unchanged (e.g. `""`).
3. **Re-render / Reconciliation Enforcement:** Whether in the current tick or on any subsequent re-render, React's Virtual DOM specifies that this `<input>` element must have `value=""`.
4. **DOM Property Reset:** React's reconciliation engine forces the real DOM node's property back into alignment with the Virtual DOM: `domElement.value = ""`.
5. Every single keystroke is immediately overwritten and discarded by React, locking the input.

---

#### 2. The hypothesis form has several different input types (select, multi-select, range, textarea). Did you use one `useState` per field, or a single object? Justify your choice — and note this question again once you get to Demo 7 (`useReducer`), which asks you to reconsider it for a different form.

##### Our Architectural Choice: A Single State Object
In [src/components/workspace/HypothesisForm.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/HypothesisForm.tsx), we chose a **single state object**:
```tsx
export interface HypothesisDraft {
  suspect: string;
  nature: 'accidental' | 'deliberate' | 'unclear' | '';
  evidenceIds: string[];
  confidence: number;
  explanation: string;
  alternative: string;
}

const [draft, setDraft] = useState<HypothesisDraft>(initialDraft);
```

##### Justification
1. **Cohesive Domain Entity:** The hypothesis draft is a single, unified document. The 6 fields do not have independent lifecycles; they are drafted together, submitted together, and saved as a single JSON payload in `localStorage` under `STORAGE_KEY_HYPOTHESIS`.
2. **Atomic Hydration and Resets:** When loading from `localStorage` on mount (or resetting the form), a single `setDraft(savedDraft)` call updates all 6 fields in a single render pass, avoiding 6 separate re-render dispatches or intermediate inconsistent states.
3. **Generic Field Updater:** We maintain a single, type-safe updater helper using immutable object spread:
   ```tsx
   const updateDraft = <K extends keyof HypothesisDraft>(field: K, value: HypothesisDraft[K]) => {
     setDraft(prev => ({ ...prev, [field]: value }));
   };
   ```

##### Reconsidering for Demo 7 (`useReducer`)
A single `useState` object works well when field transitions are simple key-value replacements (`[field]: value`). However, in **Demo 7**, we will encounter the **Evidence Filter Toolbar**, where state updates are not simple independent field edits:
- Resetting filters requires clearing 7 interdependent fields back to defaults simultaneously (`CLEAR_FILTERS`).
- Selecting a specific person or location might constrain or invalidate status/type selections.
- Complex state transitions with business rules are much more safely and cleanly encapsulated in a pure reducer function rather than scattered across component event handlers.

---

## Demo 3 — Immutable updates

### Tasks

#### 1. Rewrote Direct Mutation Anti-Patterns as Immutable Updates
In the vanilla codebase (`src/pages/evidence/script.ts` and `src/state.ts`), multiple interactions directly mutated state arrays and objects in heap memory:
- **Vanilla direct mutation instinct:**
  ```ts
  // From vanilla script.ts:
  state.bookmarks.push(evidenceId); // Mutates array directly
  ev.bookmarked = true;             // Mutates object directly
  state.filteredEvidence.sort(...); // In-place array mutation
  ```
- **Rewritten as strict immutable updates in React:**
  1. **Evidence Status and Relevance Updates** in [src/components/evidence/EvidenceView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceView.tsx):
     ```tsx
     const handleUpdateStatus = (evidenceId: string, newStatus: EvidenceStatus) => {
       setEvidenceList((prev) =>
         prev.map((ev) => (ev.id === evidenceId ? { ...ev, status: newStatus } : ev))
       );
     };

     const handleUpdateRelevance = (evidenceId: string, newRelevance: EvidenceRelevance) => {
       setEvidenceList((prev) =>
         prev.map((ev) => (ev.id === evidenceId ? { ...ev, relevance: newRelevance } : ev))
       );
     };
     ```
     Using `.map()` and object spread `{ ...ev, status: newStatus }` guarantees that the previous `evidenceList` array is not mutated, unmodified items keep their references, and the modified evidence item receives a new object reference.

  2. **Non-mutating Sorting Projection**:
     Instead of calling `.sort()` on `matches` or `evidenceList` directly, a shallow copy is made first via array spread:
     ```tsx
     return [...matches].sort((a, b) => {
       if (sortValue === 'title-asc') return a.title.localeCompare(b.title);
       if (sortValue === 'title-desc') return b.title.localeCompare(a.title);
       if (sortValue === 'date-asc') {
         return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
       }
       return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
     });
     ```
     The master collection in state remains in its original chronological/insertion order.

---

#### 2. Immutable Bookmark Toggle Logic
In [src/components/evidence/EvidenceView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceView.tsx), toggling a bookmark specifically exercises immutable array creation:
```tsx
const handleToggleBookmark = (id: string) => {
  setBookmarks((prev) => {
    const exists = prev.includes(id);
    return exists
      ? prev.filter((bId) => bId !== id) // Returns a brand-new array without the ID
      : [...prev, id];                  // Returns a brand-new array with the ID appended
  });
};
```
- When un-bookmarking, `prev.filter(...)` returns a **new array reference**.
- When bookmarking, `[...prev, id]` returns a **new array reference**.
- The `evidence` items themselves are **never mutated** with `ev.bookmarked = true/false`. Instead, bookmark status is derived purely via `bookmarks.includes(item.id)`.

---

### Questions

#### 1. Why does mutating state directly in React sometimes still appear to "work" on screen, but cause real (possibly hard-to-track) bugs elsewhere? What is React actually comparing when it decides whether to re-render?

##### What React Actually Compares: Shallow Reference Equality
When deciding whether to schedule a re-render or bail out, React compares the previous state and the next state using **shallow reference equality** (`Object.is(prevState, nextState)`).
- For primitive values (numbers, booleans, strings), `Object.is` compares values.
- For reference types (arrays and objects), `Object.is` compares **memory addresses**, not the deep contents or properties.

If you mutate an array in place:
```ts
bookmarks.push(newId);
setBookmarks(bookmarks); // Passing the EXACT SAME memory reference!
```
React evaluates `Object.is(bookmarks, bookmarks)`, which is `true`. React assumes **nothing has changed** and completely bails out of re-rendering that component!

##### Why Direct Mutation Sometimes Appears to "Work"
Direct mutation can create deceptive, phantom updates:
1. **Collateral Re-renders:** If another completely unrelated state change occurs (e.g. typing in a search box, a parent component re-rendering, a route change, or a background timer), React re-executes the component's render function. During that render pass, JSX reads the mutated object from memory and displays the updated data. The developer falsely assumes their mutation worked, unaware that the UI update was purely accidental.
2. **Child Components Skip Updates (`React.memo`):** If a child component takes the array as a prop and uses `React.memo`, it compares `prevProps.bookmarks === nextProps.bookmarks`. Since the reference didn't change, the child skips re-rendering and remains permanently stale.
3. **Broken Dependency Arrays (`useMemo` and `useEffect`):** Any hook that lists `[bookmarks]` in its dependency array will fail to detect the change, causing cached calculations and side-effects to go out of sync.

---

#### 2. The original vanilla app had a real bug where sorting evidence mutated the master array via a shared reference, permanently losing the original order. Show how your React state update for the equivalent action (bookmark toggle, or sort, if you implement it) avoids that exact class of bug. Be specific about what's different, not just "React handles it."

##### The Vanilla Bug from Exercise 1
In the vanilla implementation (`src/pages/evidence/script.ts`):
```ts
state.filteredEvidence = state.allEvidence;
...
state.filteredEvidence.sort((a, b) => a.title.localeCompare(b.title));
```
JavaScript's `Array.prototype.sort()` sorts the array **in place** (it rearranges items directly within the existing memory buffer).
Because `state.filteredEvidence` was assigned the reference to `state.allEvidence` (`filteredEvidence === allEvidence`), calling `.sort()` directly mutated `state.allEvidence`.
The original insertion order of the master dataset was permanently lost. When the user cleared filters or changed sort dropdowns, the original order could never be recovered.

##### What Is Structurally Different in Our React Implementation
1. **Master State Is Immutable:**
   The master dataset is stored in React state:
   ```tsx
   const [evidenceList, setEvidenceList] = useState<Evidence[]>(masterEvidence);
   ```
   We never assign this array reference to a shared mutable pointer.
2. **Explicit Memory Copy Before Sorting:**
   When computing the sorted view:
   ```tsx
   return [...matches].sort((a, b) => ...);
   ```
   The spread operator `[...matches]` explicitly allocates a **brand-new array instance in memory**. Calling `.sort()` only mutates this temporary, local array projection. The underlying `evidenceList` array stored in React state is never touched.
3. **No Flag Mutation on Objects:**
   In vanilla, bookmarking did `ev.bookmarked = true`. If `ev` was shared across views, mutating that property could conflict with other views. In our React implementation, `evidence` objects are read-only; bookmark status is derived purely from the immutable `bookmarks: string[]` array.

---

## Demo 4 — Derived values vs. stored state

### Tasks

#### 1. Evidence Filtering and Sorting Computed Entirely During Render
In [src/components/evidence/EvidenceView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/evidence/EvidenceView.tsx), the filtered and sorted evidence collection is **computed synchronously during render** using `useMemo`:
```tsx
const filteredAndSortedEvidence = useMemo(() => {
  const term = searchTerm.toLowerCase().trim();

  const matches = evidenceList.filter((item) => {
    if (term) {
      const haystack = (item.title + ' ' + item.summary + ' ' + (item.tags || []).join(' ')).toLowerCase();
      if (haystack.indexOf(term) === -1) return false;
    }
    if (filterType && item.type.toLowerCase() !== filterType.toLowerCase()) return false;
    if (filterPerson) {
      const pIds = item.personIds || [];
      const person = people.find((p) => p.id === filterPerson);
      const personName = person ? person.name : '';
      if (!pIds.includes(filterPerson) && (!personName || !pIds.includes(personName))) return false;
    }
    if (filterLocation && (!item.locationIds || !item.locationIds.includes(filterLocation))) return false;
    if (filterStatus && (item.status || '').toLowerCase() !== filterStatus.toLowerCase()) return false;
    if (filterRelevance && (item.relevance || '').toLowerCase() !== filterRelevance.toLowerCase()) return false;
    return true;
  });

  return [...matches].sort((a, b) => {
    if (sortValue === 'title-asc') return a.title.localeCompare(b.title);
    if (sortValue === 'title-desc') return b.title.localeCompare(a.title);
    if (sortValue === 'date-asc') return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}, [evidenceList, searchTerm, filterType, filterPerson, filterLocation, filterStatus, filterRelevance, sortValue, people]);
```
- There is **no** `const [filteredEvidence, setFilteredEvidence] = useState(...)`.
- The list is a pure projection of `evidenceList` and the active filter/sort controls. It can never drift out of sync.

---

#### 2. Single Source of Truth for Bookmarks and Counts Across Views
- **Dashboard Bookmark Count** ([src/components/dashboard/DashboardView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/dashboard/DashboardView.tsx)):
  Passed directly as `bookmarkCount={bookmarks.length}` to `StatGrid`. It is not stored in state as a separate counter integer.
- **Dashboard Review Progress & Counts**:
  `reviewedCount` is derived via:
  ```tsx
  const reviewedCount = useMemo(() => {
    return evidence.filter((item) => (item.status || '').toLowerCase() === 'reviewed').length;
  }, [evidence]);
  ```
  `progressPct` is derived via:
  ```tsx
  const progressPct = useMemo(() => {
    return evidence.length === 0 ? 0 : Math.round((reviewedCount / evidence.length) * 100);
  }, [evidence.length, reviewedCount]);
  ```
- **Workspace Bookmarked Items** ([src/components/workspace/BookmarkedEvidenceList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/workspace/BookmarkedEvidenceList.tsx)):
  Computed during render directly:
  ```tsx
  const bookmarkedItems = evidence.filter((ev) => bookmarks.includes(ev.id));
  ```
  No duplicated array of bookmarked objects is maintained in state.

---

### Questions

#### 1. What's the rule for deciding whether something belongs in `useState` versus being computed inline (or via `useMemo`) during render? Apply that rule to the filtered evidence list and justify your answer.

##### The Architectural Rule
> **"Don't put in state what you can compute during render from existing props and state."**

To determine if any data belongs in `useState`, ask three questions:
1. *Does it remain constant across the component's lifecycle?* If yes, it is a constant.
2. *Is it passed into the component from a parent via props?* If yes, it is a prop, not state.
3. *Can it be computed from existing state or props?* If yes, it is **derived data; never store it in `useState`**.

##### Application to the Filtered Evidence List
- The filtered and sorted list is an exact mathematical projection:
  $$\text{filteredEvidence} = f(\text{allEvidence}, \text{searchTerm}, \text{filters}, \text{sortBy})$$
- **What would go wrong if stored in `useState`:**
  - If we had `const [filteredList, setFilteredList] = useState([])`:
  - Every time `searchTerm` changed, we would need to trigger an effect or setter call `setFilteredList(...)`.
  - This would force **two consecutive render cycles** for every single keystroke or dropdown change: the first render updates the filter input, and the second render updates the list.
  - It creates opportunities for race conditions, intermediate stale frames, and desynchronization (e.g., if an evidence item's review status or relevance was updated in the detail modal, `filteredList` would remain stale unless someone remembered to re-run the filtering logic).
- **By computing it during render** (using `useMemo` to skip recomputation when dependencies haven't changed), the list is **guaranteed to be 100% fresh, instantaneous, and mathematically consistent** on every single render tick.

---

#### 2. The vanilla app had two related bugs here: a dashboard bookmark count that could go stale (because it only re-rendered on a view's first visit), and a `filteredEvidence` variable that was sometimes literally the *same array reference* as the master list. Explain, concretely, why deriving these values during render instead of storing them makes **both** of those bug classes structurally impossible, not just less likely.

##### Concrete Analysis of Why Both Bug Classes Are Structurally Prevented

1. **Elimination of the Stale Dashboard Bookmark Count Bug:**
   - *How the vanilla bug occurred:* The vanilla dashboard calculated the bookmark count once when the view first initialized (`renderDashboard()`) and imperatively stamped that integer into the DOM text (`<div id="statBookmarks">0</div>`). When the user navigated away to Evidence, bookmarked items, and navigated back to the Dashboard, the dashboard DOM was never updated. Storing the count as a static value in DOM memory caused it to become stale.
   - *Why deriving in React makes it structurally impossible:* In our React architecture, the dashboard does not store a count variable anywhere in state or DOM. It receives `bookmarks` and renders `{bookmarks.length}`. Whenever `bookmarks` state updates, React invokes the dashboard's render function, evaluating `{bookmarks.length}` on the fly. It is structurally impossible for the count to be stale because there is **no secondary storage location** in memory where a stale count could exist.

2. **Elimination of the Shared Array Reference Bug:**
   - *How the vanilla bug occurred:* In `src/pages/evidence/script.ts`, `state.filteredEvidence` was a persistent variable on the global store. When no filters were selected, the code assigned `state.filteredEvidence = state.allEvidence`. Because JavaScript passes arrays by reference, `state.filteredEvidence` pointed to the exact same array in heap memory as `state.allEvidence`. Calling `.sort()` on `filteredEvidence` directly mutated the master `allEvidence` array, destroying its original order permanently.
   - *Why deriving in React makes it structurally impossible:* In React, `filteredAndSortedEvidence` is a transient local variable computed inside `useMemo` via `.filter(...)`. By specification (ECMAScript), `Array.prototype.filter()` **always returns a brand-new array instance**, even if every element matches. The subsequent `[...matches].sort(...)` sorts only this freshly allocated projection. The master array in `useState` is never referenced as the filtered array, nor is it ever exposed to sorting. Shared-reference mutation is prevented by construction.


