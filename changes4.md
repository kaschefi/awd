# Exercise 4 — React UI & Component Design

## Demo 1 — JSX, function components, typed props, composition & children

### Tasks

#### 1. Built 3 small components with explicitly typed props for People & Locations and Timeline

We created three focused, presentational components for the views being migrated:

1. **`PersonCard`** ([PersonCard.tsx]):
   - Renders a team member's avatar, name, role, speciality, responsibilities list, quote statement, and associated evidence count.
   - Props interface:
     ```tsx
     export interface PersonCardProps {
       person: Person;
       evidenceCount?: number;
       onViewEvidence?: (personId: string) => void;
     }
     ```
2. **`LocationCard`** ([LocationCard.tsx]):
   - Renders a facility area (ID, display name, description, and list of contained assets/equipment).
   - Props interface:
     ```tsx
     export interface LocationCardProps {
       location: Location;
     }
     ```
3. **`TimelineEventCard`** ([TimelineEventCard.tsx]):
   - Renders a chronological incident log entry with certainty badge styling, formatted timestamp, description, location tags, and evidence quick-view buttons.
   - Props interface:
     ```tsx
     export interface TimelineEventCardProps {
       event: TimelineEvent;
       locationNames?: string[];
       onViewEvidence?: (evidenceId: string) => void;
     }
     ```

Each component enforces strict TypeScript contracts with no `any` or loose types.

---

#### 2. Built a generic wrapper component taking `children` (composition) and used it in a real place

We created **`Card`** ([Card.tsx]):
```tsx
import React from 'react';

export interface CardProps {
  title?: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className = '', children }: CardProps) {
  const combinedClassName = className ? `card ${className}` : 'card';

  return (
    <div className={combinedClassName}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </div>
  );
}
```

**Real usage in the application:**
Inside both [LocationCard.tsx] and [PersonCard.tsx], rather than hardcoding repetitive panel markup or passing raw text as rigid data props, both components compose their inner layout by placing their unique elements directly as `children` of `<Card>`:

```tsx
// LocationCard using Card
export const LocationCard: React.FC<LocationCardProps> = ({ location }) => (
  <Card className="location-card">
    <h3>{location.id} &mdash; {location.name}</h3>
    <p>{location.description}</p>
    <ul>{location.contains.map(item => <li key={item}>{item}</li>)}</ul>
  </Card>
);

// PersonCard using Card
export const PersonCard: React.FC<PersonCardProps> = ({ person, evidenceCount, onViewEvidence }) => (
  <Card className="person-card">
    <div className="person-card-header">...</div>
    ...
  </Card>
);
```


---

### Questions

#### 1. Show one JSX expression in your code that embeds a JavaScript value or expression (not just static markup). What can and can't go inside `{...}` in JSX?

**Example from our code (`PersonCard.tsx`):**
```tsx
<p>
  {evidenceCount} related evidence item{evidenceCount === 1 ? '' : 's'} &mdash;{' '}
  {onViewEvidence ? (
    <button
      type="button"
      className="evidence-count-link"
      onClick={() => onViewEvidence(person.id)}
    >
      view
    </button>
  ) : (
    <span className="text-muted">(none)</span>
  )}
</p>
```
Here, `{evidenceCount === 1 ? '' : 's'}` dynamically computes whether to append plural `'s'`, and `{onViewEvidence ? (...) : (...)}` uses a JavaScript ternary expression to decide which element to render.

**What CAN go inside `{...}` in JSX:**
Only JavaScript **expressions** (code that produces / evaluates to a value).
- Primitive values (strings, numbers, booleans): `{person.name}`, `{42}`
- Variable lookups and property access: `{person.role}`, `{event.time}`
- Operators and computed math/string expressions: `{a + b}`, `{count === 1 ? '' : 's'}`
- Function calls: `{formatDate(event.time)}`, `{certaintyBadgeClass(event.certainty)}`
- Array transformations: `{location.contains.map(item => <li key={item}>{item}</li>)}`
- Other JSX elements / fragments: `{isActive ? <ActiveBadge /> : null}`

**What CANNOT go inside `{...}` in JSX:**
JavaScript **statements** (code that performs an action or controls flow but does not evaluate to a value).
- Control-flow statements: `if (...) { ... }`, `switch (...) { ... }` (must use ternary `? :` or `&&` instead)
- Loop statements: `for (...)`, `while (...)`, `do ... while` (must use array methods like `.map()`)
- Variable declarations: `let x = 1;`, `const y = 2;`
- Function declarations or class declarations: `function foo() {}` (inline arrow functions like `() => onViewEvidence(person.id)` are function *expressions*, which are permitted)
- Plain JavaScript objects directly inside text nodes (e.g. `{{ foo: 'bar' }}`), which throws a runtime React error: *"Objects are not valid as a React child"*.

---

#### 2. For one component's typed props: what would TypeScript catch if you passed the wrong shape of data to it? Demonstrate a real type error by passing something wrong on purpose.

In `PersonCard`, our props interface requires:
```tsx
export interface PersonCardProps {
  person: Person;
  evidenceCount?: number;
  onViewEvidence?: (personId: string) => void;
}
```

If a developer passes:
```tsx
// Purposeful Error 1: Missing required property 'person'
<PersonCard evidenceCount={5} />
// TS Error: Property 'person' is missing in type '{ evidenceCount: number; }' but required in type 'PersonCardProps'.

// Purposeful Error 2: Wrong property type for 'evidenceCount'
<PersonCard person={somePerson} evidenceCount="five" />
// TS Error: Type 'string' is not assignable to type 'number | undefined'.

// Purposeful Error 3: Wrong signature on callback prop
<PersonCard person={somePerson} onViewEvidence={(id: number) => console.log(id)} />
// TS Error: Type '(id: number) => void' is not assignable to type '(personId: string) => void'. Types of parameters 'id' and 'personId' are incompatible. Type 'string' is not assignable to type 'number'.
```

TypeScript catches these discrepancies statically at build/compile time inside the IDE and in `tsc --noEmit`, preventing runtime `undefined` property crashes (like `cannot read properties of undefined (reading 'name')`) before code ever hits the browser.

---

#### 3. What's the difference between passing data as a named prop versus passing it as `children`? Why did you choose `children` for the component you built with it?

- **Named prop (Data-driven):**
  - Data is passed as a typed property: `<PersonCard person={person} evidenceCount={3} />`
  - The child component has **complete control over how that data is structured and rendered**. The parent only provides the raw data.
  - Ideal for domain-specific components with a fixed layout structure (`PersonCard`, `TimelineEventCard`).
- **`children` prop (Composition-driven):**
  - Content is placed between the opening and closing JSX tags: `<Card><h3>Title</h3><p>Content</p></Card>`
  - The parent controls **what content exists and in what order**, while the wrapper component only controls the outer presentation, layout frame, border, or background styling.
  - The wrapper does not need to know or care whether the inside contains text, lists, images, or another nested React component.

**Why we chose `children` for `Card`:**
`Card` is a layout shell. It provides common styling (`.card`, border, padding, shadow, border-radius). If we didn't use `children`, `Card` would need an endless list of specialized props (`personName`, `personRole`, `locationContains`, `eventTimestamp`, etc.), leading to tight coupling and poor maintainability. With `children`, `LocationCard` can inject its specific headings, paragraphs, and list items cleanly into the generic container.

---

#### 4. Why does direct DOM manipulation (as the old vanilla `app.js` did constantly, e.g. `innerHTML`, `classList.add/remove`, manually building elements) conflict with React's rendering model? What assumption does React make about who "owns" the DOM that direct manipulation breaks?

1. **The Single Owner Assumption:**
   React assumes that **it has exclusive ownership and control of the DOM tree** mounted under its root container. React maintains an internal representation of the UI (the Virtual DOM / fiber tree) that reflects the current state of props and state.
2. **Reconciliation and the Virtual DOM:**
   When a component renders, React compares the new Virtual DOM tree against the previous Virtual DOM tree (a process called *reconciliation* / *diffing*) and computes the minimal set of DOM mutations needed to bring the real browser DOM into alignment.
3. **What breaks when you manipulate the DOM directly:**
   - **Desynchronization:** If external JavaScript modifies an element (e.g. `element.innerHTML = '...'`, `element.classList.add('active')`, or removing a node with `removeChild()`), the real browser DOM no longer matches React's internal Virtual DOM record.
   - **Silently Overwritten Mutations:** When React re-renders on the next state/prop change, it assumes the DOM is still in the state it left it. It will overwrite or wipe out your manual changes without warning.
   - **Catastrophic Runtime Crashes:** If vanilla code removes an element that React expects to be present, React will attempt to execute operations like `parentNode.insertBefore(...)` on a missing node, triggering fatal runtime errors such as:
     `NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.`
   - **Event Listener Leaks:** React uses a synthetic event system attached at the root. Direct manual DOM destruction can bypass React's cleanup handlers, resulting in orphaned listeners and memory leaks.

---

## Demo 2 — Conditional rendering

### Tasks

#### 1. Implemented real conditional-rendering cases in migrated views

We implemented multiple real-world conditional rendering scenarios across the migrated views:

1. **Empty State Conditional Rendering:**
   - In [TimelineList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineList.tsx), when zero events match the current filter selection (`events.length === 0`), we conditionally render an empty state message instead of an empty timeline axis:
     ```tsx
     if (events.length === 0) {
       return (
         <div className="empty-state">
           <p>No timeline events match the current filters.</p>
         </div>
       );
     }
     ```
   - Similarly, [PeopleList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PeopleList.tsx) and [LocationsList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/LocationsList.tsx) guard against empty arrays by displaying `<p className="empty-state">No people registered.</p>`.

2. **State-Dependent Style and Label Conditional Rendering:**
   - In [PeopleLocationsView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PeopleLocationsView.tsx), the active navigation tab receives the `.active` CSS class conditionally based on `activeTab`:
     ```tsx
     <button
       type="button"
       className={`tab-btn ${activeTab === 'people' ? 'active' : ''}`}
       onClick={() => setActiveTab('people')}
     >
       Personnel ({people.length})
     </button>
     ```
   - In [TimelineEventCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineEventCard.tsx), certainty badge variants (`confirmed`, `contradictory`, `reported`) dynamically determine CSS styling using the mapping helper `certaintyBadgeClass(event.certainty)`.

---

#### 2. Applied multiple distinct conditional-rendering techniques

We utilized four distinct conditional rendering techniques:

1. **Early Return:**
   - Used in `TimelineList.tsx` for the empty state. Guarding early keeps the happy path uncluttered and avoids deep JSX indentation.
2. **Logical AND (`&&`):**
   - Used in `TimelineEventCard.tsx` to conditionally display optional metadata only when items exist:
     ```tsx
     {locationNames.length > 0 && (
       <p className="evidence-meta">Location: {locationNames.join(', ')}</p>
     )}
     ```
     and for evidence quick-view buttons:
     ```tsx
     {event.evidenceIds && event.evidenceIds.length > 0 && (
       <div>{event.evidenceIds.map(...)}</div>
     )}
     ```
3. **Ternary Operator (`? :`):**
   - Used in `PeopleLocationsView.tsx` to switch between `<PeopleList />` and `<LocationsList />`:
     ```tsx
     {activeTab === 'people' ? (
       <PeopleList people={people} onViewEvidence={onNavigateToEvidence} />
     ) : (
       <LocationsList locations={locations} />
     )}
     ```
   - Used in `PersonCard.tsx` for grammar plurality: `{evidenceCount === 1 ? '' : 's'}` and for rendering either a button or a fallback `(none)` label.
4. **Lookup / Mapping Function:**
   - Used in `TimelineEventCard.tsx` via `certaintyBadgeClass(certainty)`, which maps categorical certainty strings to badge CSS classes (`reviewed`, `critical`, `flagged`).

---

### Questions

#### 1. Show one place where you used `condition && <Component />` instead of a ternary. What would go wrong if `condition` were a number like `0` instead of a boolean, and does that risk apply to your actual code?

**Example from our code (`TimelineEventCard.tsx`):**
```tsx
{locationNames.length > 0 && (
  <p className="evidence-meta">Location: {locationNames.join(', ')}</p>
)}
```

**What goes wrong if `condition` is `0`:**
In JavaScript, the logical AND (`&&`) operator performs short-circuit evaluation:
- If the left operand is falsy, JavaScript returns the value of the left operand itself, NOT the boolean `false`.
- Therefore, `0 && <Component />` evaluates to `0`.
- In React JSX, booleans (`true`, `false`), `null`, and `undefined` are completely ignored and render nothing to the DOM.
- However, the number `0` is a valid React text node! React will treat it as printable text and will literally render `"0"` onto the user's screen.
For example, if we had written:
```tsx
{locationNames.length && (
  <p className="evidence-meta">Location: ...</p>
)}
```
When `locationNames` is an empty array (`length === 0`), the user would see a stray, confusing `"0"` printed right on the timeline card!

**Does this risk apply to our actual code?**
**No.** We proactively prevented this bug by writing `locationNames.length > 0`. Because comparison operators (`>`) strictly evaluate to a boolean (`true` or `false`), when `length` is 0 the left operand evaluates to `false`. React ignores `false`, so nothing is rendered.

---

#### 2. Why might returning `null` from a component be preferable to returning an empty `<div>` in some cases? Did you use either, and why?

**Why returning `null` is preferable to an empty `<div>`:**
1. **No Phantom DOM Nodes:**
   Returning `null` tells React: *"Do not mount anything in the DOM for this component."*
   Returning `<div />` creates an actual, physical `HTMLDivElement` in the real browser DOM.
2. **Preserving CSS Layouts (Flexbox & CSS Grid):**
   If a parent container uses `display: flex` with `gap: 12px`, or `display: grid`, every child element (even an empty `<div></div>` with 0 width and height) is treated as a grid item or flex item. The empty `<div>` will create phantom spacing, unnecessary gaps, or shift other items out of alignment.
3. **Preserving CSS Pseudo-Classes:**
   CSS selectors such as `:empty`, `:first-child`, `:last-child`, and `:nth-child()` rely on exact DOM sibling structure. An invisible empty `<div>` breaks `:first-child` or prevents `:empty` from matching.
4. **Accessibility (A11y):**
   Screen readers and assistive technology traverse the DOM tree. Empty wrapper divs clutter the accessibility tree with meaningless nodes.

**Did we use either, and why?**
- When we need to show nothing, we return `null` or let conditional expressions evaluate to `false` / `null` so no unwanted wrapper elements pollute the DOM.
- When an empty state needs to communicate information to the user (such as *"No timeline events match the current filters"*), we return a semantic `<div className="empty-state"><p>...</p></div>` with meaningful instructional text rather than a blank div.

---

## Demo 3 — Rendering collections

### Tasks

#### 1. Rendered People, Locations, and Timeline collections as mapped components with proper keys

We mapped all three collections from raw data arrays to declarative component trees using JavaScript's `.map()` array method:

1. **People Collection:**
   - In [PeopleList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PeopleList.tsx):
     ```tsx
     <div className="people-grid">
       {people.map((person) => (
         <PersonCard
           key={person.id}
           person={person}
           evidenceCount={evidenceCount}
           onViewEvidence={onViewEvidence}
         />
       ))}
     </div>
     ```
   - Each rendered item uses `person.id` (e.g. `'patch-vector'`, `'maya-lin'`) as its stable, unique key.

2. **Locations Collection:**
   - In [LocationsList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/LocationsList.tsx):
     ```tsx
     <div className="locations-grid">
       {locations.map((loc) => (
         <LocationCard key={loc.id} location={loc} />
       ))}
     </div>
     ```
   - Each rendered item uses `loc.id` (e.g. `'LOC-01'`, `'LOC-02'`) as its unique key.

3. **Timeline Events Collection:**
   - In [TimelineList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineList.tsx):
     ```tsx
     <div className="timeline-container">
       {events.map((event) => (
         <TimelineEventCard
           key={event.id}
           event={event}
           locationNames={locationNames}
           onViewEvidence={onViewEvidence}
         />
       ))}
     </div>
     ```
   - Each rendered item uses `event.id` (e.g. `'evt-01'`, `'evt-02'`) as its unique key.

---

### Questions

#### 1. What does React actually use `key` for internally?

1. **Persistent Identity Across Renders:**
   Inside React's reconciliation engine (Fiber architecture), `key` provides a **stable identifier that binds a Virtual DOM node to its underlying real DOM node and internal component state across consecutive renders**.
2. **Reconciliation & Diffing Optimization:**
   When a parent re-renders, React receives a new array of children. React needs to determine what changed between the old list of Virtual DOM elements and the new list.
   - **Without keys (or using array indices):** React compares elements purely by index position (0 to 0, 1 to 1). If an item is prepended at index 0, React sees that position 0 now has different props, position 1 has different props, and so on. React will unnecessarily mutate every single DOM node in the entire list and create a new node at the end.
   - **With stable keys:** React matches old nodes with new nodes by their key (`oldFiber.key === newFiber.key`). Even if the items have moved, sorted, or filtered:
     - React recognizes that an item moved from index 0 to index 4, and performs a single efficient DOM `.insertBefore()` operation instead of rebuilding it.
     - New keys mount new DOM elements.
     - Removed keys are cleanly unmounted and destroyed.
3. **Preserving Component State and Focus:**
   `key` informs React which component instance should retain its local state (such as input focus, form field values, CSS transitions, and hook state). Changing an item's key signals to React that the item has been replaced with a completely different entity, resetting its local state.

---

## Demo 4 — Stable keys and list identity

### Tasks

#### 1. Deliberately used `key={index}` in a throwaway example, demonstrated the visible state-corruption bug, and restored stable entity IDs

We configured an interactive demonstration in [TimelineView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineView.tsx) and [TimelineList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineList.tsx):

1. **Setup:**
   - In `TimelineView`, we provided an Order sorting dropdown (**Oldest first** vs. **Newest first**).
   - In `TimelineEventCard`, each card included an uncontrolled investigator note `<input placeholder="Note for {event.id}..." />`.
2. **The `key={index}` Demonstration:**
   - In `TimelineList.tsx`, we deliberately changed the mapping key from `key={event.id}` to `key={index}`:
     ```tsx
     {events.map((event, index) => (
       <TimelineEventCard key={index} event={event} ... />
     ))}
     ```
   - **User Action:** Under **Oldest first**, the first card was event **T01** (*"Patch raises a calibration-cache safety concern"*). We typed into its note input: `"NOTE BELONGS TO EVT 01"`.
   - **Triggering Re-order:** We changed the dropdown to **Newest first**, reversing the array.
   - **The Bug Observed Live:**
     - The event at index 0 swapped to **T15** (*"The public demonstration is cancelled"*).
     - However, the note input at the top STILL contained `"NOTE BELONGS TO EVT 01"`.
     - React matched index `0` to index `0`, saw identical keys (`"0"` == `"0"`), and preserved the existing real DOM input element in place, updating only the text props of the card around it.
     - The user's typed note was corrupted and transferred to the wrong event.
3. **Restoring Stable Keys (`key={event.id}`):**
   - We reverted `TimelineList.tsx` to use the permanent entity identifier:
     ```tsx
     {events.map((event) => (
       <TimelineEventCard key={event.id} event={event} ... />
     ))}
     ```
   - **Verification:** When repeating the test, typing a note on **T01** and sorting by **Newest first**:
     - The top card (**T15**) showed an empty note input as expected.
     - Card **T01** moved to the bottom of the page, carrying its note `"NOTE BELONGS TO EVT 01"` with it. React matched the DOM node by `key="T01"` and moved the node in the DOM rather than overwriting it in place.

---

### Questions

#### 1. What goes wrong, concretely, when keys are missing, duplicated, or based on array index for a list that can reorder or filter?

1. **Missing Keys (`key` omitted):**
   - React falls back to using array index by default and logs a runtime console warning (*"Each child in a list should have a unique 'key' prop"*).
   - Every insertion, deletion, or reorder forces React to mutate every DOM node from the point of change downward, resulting in degraded performance and state detachment.
2. **Duplicated Keys (two siblings share `key="same-id"`):**
   - React's reconciliation algorithm relies on unique keys to build a map (`Map<Key, Fiber>`) for O(N) lookup.
   - When keys collide, React cannot distinguish between duplicate elements during diffing. React will emit a console error (*"Encountered two children with the same key"*). DOM nodes may fail to update, disappear during unmounting, or exhibit unpredictable rendering glitches.
3. **Index Keys (`key={index}`) on lists that reorder, sort, or filter:**
   - **State Corruption on Uncontrolled Inputs:** Form fields (`<input>`, `<textarea>`, checkboxes) hold their state in the browser DOM. Because React considers index `0` to always be the same component instance, form values stay at their index position instead of following the data item.
   - **Broken Animations / Transitions:** CSS enter/leave transitions attach to DOM nodes. Reordering with index keys causes in-place text replacement rather than visual sliding/sorting animations.
   - **Sub-tree State Misalignment:** If child components have internal `useState`, `useRef`, or `useEffect` timers, those internal states remain pinned to the index rather than the entity.

---

#### 2. The *original* vanilla version of this app had a real bug where one feature used an array index as an identifier instead of a stable id. Would that same mistake, ported directly into React as `key={index}`, have caused a symptom a user could notice, or only a console warning? Explain why.

- **Yes, it would have caused a symptom a user could notice!**
- In the original vanilla version of the app, evidence items were referenced in HTML templates via their array index (e.g. `data-index="${i}"`). When evidence was filtered by tag or sorted, clicking "Bookmark" on the first filtered card operated on `state.allEvidence[0]` instead of the actual clicked item, bookmarking the wrong item entirely.
- In React, if list items are purely passive and stateless (only rendering immutable props into text nodes), `key={index}` causes a performance hit and extra DOM text updates, but the rendered text eventually matches the prop.
- **However, as soon as interactive features exist:**
  - Selecting an evidence card (which stores selected ID or modal state).
  - Checking a bookmark star or checkbox.
  - Adding investigator notes or expanding accordion cards.
- With `key={index}`, filtering the list will leave checkboxes and input focus attached to the wrong item. A user filtering for "critical" items would see checkboxes checked that they never selected, or watch their expanded card collapse while an unrelated card expands. This is a severe, noticeable user-facing data corruption symptom, not just a benign console warning.

---

#### 3. All of this app's real data (people, locations, timeline events) already has stable ids. Is there ever a legitimate reason to use `key={index}` anyway? When?

**Yes, but ONLY when all three of the following conditions are simultaneously met:**
1. **The list is strictly static:** The array is never filtered, sorted, reordered, paginated, or mutated after initial render.
2. **Items are purely presentational and stateless:** The items have no local `useState`, no uncontrolled form inputs (`<input>`, `<select>`), no `useRef`, and no internal component state.
3. **The data has no natural unique identifier:** For instance, rendering a static list of bullet points from a fixed string array (e.g. `responsibilities: string[]` on `PersonCard` where items are static strings like `["Lead clinician", "Supervise safety protocols"]`), or static breadcrumbs, or a fixed pagination number strip (`[1, 2, 3, 4]`).

Even in these cases, if the items are strings and unique, `key={string}` is preferable. `key={index}` should be treated as an explicit last resort.

---

## Demo 5 — Presentational vs. feature components and component boundaries

### Tasks

#### 1. Classified every component as either "presentational" or "feature/container"

We classified all components in the React migration based on their responsibilities:

| Component | Classification | Architectural Justification |
|---|---|---|
| **`Card`** | **Presentational** | Visual container shell. Knows nothing about domain models; accepts only `title`, `className`, and `children: React.ReactNode`. |
| **`PersonCard`** | **Presentational** | Focused strictly on rendering a single person's profile, role, avatar, and statement. Takes data and an `onViewEvidence` callback strictly via typed props. |
| **`LocationCard`** | **Presentational** | Purely renders a location entity's ID, name, description, and contents list. Has no internal state or external hooks. |
| **`TimelineEventCard`** | **Presentational** | Renders a single timeline incident entry with certainty badge and formatted timestamp. Free of business logic; delegates evidence clicks via callback. |
| **`TimelineToolbar`** | **Presentational** | Purely renders the sorting order dropdown and filter selectors. Receives all options and `onChange` callbacks via props with zero internal data-fetching. |
| **`TimelineList`** | **Presentational** | Focuses on mapping an array of events to cards or rendering the empty state. Has no state management or API connection. |
| **`PeopleList`** | **Presentational** | Takes an array of people and renders the grid layout or empty state message. |
| **`LocationsList`** | **Presentational** | Takes an array of locations and renders the grid layout or empty state message. |
| **`Header` / `Footer`** | **Presentational** | Renders the navigation bar and footer markup, emitting `onNavigate` callbacks to the shell. |
| **`TimelineView`** | **Feature / Container** | Orchestrates the timeline view: connects to `usePortalData()`, maintains sort order state (`asc` / `desc`), filters items, and coordinates `TimelineToolbar` and `TimelineList`. |
| **`PeopleLocationsView`** | **Feature / Container** | Orchestrates the team view: connects to `usePortalData()`, manages `activeTab` state (`people` vs `locations`), and swaps child list views. |
| **`DashboardView`** | **Feature / Container** | Orchestrates case overview: subscribes to `usePortalData()`, calculates derived aggregate stats (progress %, reviewed counts), and renders dashboard cards. |
| **`App` (ReactApp)** | **Feature / Container** | Top-level application shell: manages URL hash synchronization, handles coexistence switching between React and Vanilla modes, and conditionally mounts views. |

---

#### 2. Split a multi-responsibility component into two focused components with a clean boundary

**Component Identified:** [TimelineView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineView.tsx) was originally doing two distinct jobs:
1. Managing view state, data subscriptions, and sorting/filtering logic.
2. Rendering the full layout, select elements, labels, and options for the toolbar controls.

**The Split:**
We extracted the toolbar into [TimelineToolbar.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineToolbar.tsx):
- **`TimelineToolbar` (Presentational Half):**
  ```tsx
  export interface TimelineToolbarProps {
    order: 'asc' | 'desc';
    onOrderChange: (order: 'asc' | 'desc') => void;
    selectedPerson?: string;
    onPersonChange?: (personId: string) => void;
    selectedLocation?: string;
    onLocationChange?: (locationId: string) => void;
    selectedType?: string;
    onTypeChange?: (type: string) => void;
    people: Person[];
    locations: Location[];
    eventTypes: string[];
  }
  ```
- **`TimelineView` (Container Half):**
  Now cleanly delegates the toolbar rendering to `<TimelineToolbar ... />` and focuses exclusively on managing data and sorting.

---

### Questions

#### 1. For the component you split: what was the single responsibility of each half after the split? If an implementation detail in one half changed, would that change affect the other half? Why or why not?

- **Single Responsibility of `TimelineToolbar`:**
  To render the visual UI controls for sorting and filtering, and notify the parent when a user selects a different value. It has zero knowledge of how events are sorted or where data comes from.
- **Single Responsibility of `TimelineView`:**
  To manage the application lifecycle and state for the timeline feature (subscribing to `usePortalData()`, sorting/filtering the events array, and assembling child components).

- **Would an implementation detail change in one half affect the other half?**
  **No.** The boundary between them is strictly defined by TypeScript props interfaces:
  - If we completely redesign the toolbar UI (e.g. replacing `<select>` dropdowns with interactive chip buttons, a search bar, or an accessible dropdown library), **`TimelineView` does not change at all** as long as `TimelineToolbar` still fires `onOrderChange` and `onPersonChange`.
  - Conversely, if we change how timeline events are loaded or sorted (e.g. sorting on the backend, or changing the date comparator algorithm), **`TimelineToolbar` is completely unaffected** because it only consumes the resulting data via props.

---

#### 2. Give one concrete rule you used to decide "this belongs in a presentational component" versus "this belongs in a feature component."

**The Golden Rule:**
> **"If a component needs to know *where* data comes from (hooks, global state, APIs, URL parameters) or *what business logic* to run when an action occurs, it belongs in a Feature/Container component. If a component only needs to know *how to render* given data and fires callbacks upward without knowing the business consequences, it belongs in a Presentational component."**

A simple litmus test: *"Can I render this component in Storybook or a test by just passing mock props, without setting up network providers, route contexts, or global stores?"*
- If **Yes**, it is a **Presentational component**.
- If **No** (it requires ambient state, router state, or data providers), it is a **Feature/Container component**.

---

## Demo 6 — Feature-oriented folder structure

### Tasks

#### 1. Reorganized React components into a feature-oriented directory structure

We restructured the component tree so that all files are grouped by domain features and shared primitives rather than a flat unstructured folder:

```
src/components/
├── common/             # Reusable UI primitives and global layout shell
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── NotFoundView.tsx
│   └── StubView.tsx
├── dashboard/          # Case Dashboard domain
│   ├── CaseSummaryCard.tsx
│   ├── DashboardView.tsx
│   ├── HowToUsePortal.tsx
│   ├── RecentEvidenceList.tsx
│   ├── RecentTimelineList.tsx
│   ├── ReviewProgress.tsx
│   ├── StatCard.tsx
│   └── StatGrid.tsx
├── people_locations/   # Personnel & Facility Locations domain
│   ├── LocationCard.tsx
│   ├── LocationsList.tsx
│   ├── PeopleList.tsx
│   ├── PeopleLocationsView.tsx
│   └── PersonCard.tsx
└── timeline/           # Investigation Timeline domain
    ├── TimelineEventCard.tsx
    ├── TimelineList.tsx
    ├── TimelineToolbar.tsx
    └── TimelineView.tsx
```

All import paths across [ReactApp.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/ReactApp.tsx) and subcomponents were updated to reflect this feature hierarchy.

---

#### 2. Documented the structure and boundary rules in `ARCHITECTURE.md`

We created [ARCHITECTURE.md](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/ARCHITECTURE.md) documenting:
- The full directory tree.
- The boundary rule for classifying code as "shared" vs "feature-local".

---

### Questions

#### 1. What's the difference between organizing files "by type" (all components in one folder, all hooks in another) versus "by feature"? What made you choose the structure you chose for this app specifically?

- **Organization "By Type" (Technical Layering):**
  - Files are grouped by their technical role: `components/`, `hooks/`, `utils/`, `types/`.
  - **Downside:** High coupling across folders. A developer working on the Timeline must constantly open 4 different folders (`components/TimelineCard.tsx`, `hooks/useTimeline.ts`, `types/timeline.ts`, `utils/timelineFormatters.ts`). When a feature is retired or refactored, deleting it requires hunting down disparate files scattered throughout the project.
- **Organization "By Feature" (Vertical Slicing / Domain Colocation):**
  - Files are grouped by what user-facing business feature they serve: `dashboard/`, `timeline/`, `people_locations/`.
  - **Advantage:** Maximum cohesion and minimal mental friction. All files that change together live together. The entire feature is self-contained.
- **Why we chose this for this app specifically:**
  - Project ReMotion is an investigation portal consisting of 5 distinct investigation tools (Dashboard, Evidence, People/Locations, Timeline, Workspace). Each view has its own unique domain types, layout requirements, and subcomponents. Grouping by feature allows each view to be developed, migrated, and maintained in complete isolation.

---

#### 2. Where did you draw the line between a component that lives inside one feature folder and one that belongs in a shared/common folder? Give one real example of each from your own structure.

**The Boundary Rule:**
1. **Belongs in `common/` (Shared):**
   - The component is **domain-agnostic**: it has no knowledge of domain entities like `Person`, `Location`, or `TimelineEvent`.
   - It is reused across two or more unrelated features or provides global layout shell structure.
   - **Real Example:** `Card` in `src/components/common/Card.tsx`. It provides an outer panel frame, border, and shadow using `children: React.ReactNode`, and is reused across both `PersonCard` and `LocationCard`.
2. **Belongs in a Feature folder (Feature-Local):**
   - The component is **domain-specific**: it exists solely to support that specific investigation view and understands that feature's typed domain models.
   - It would make no sense on an unrelated page.
   - **Real Example:** `TimelineToolbar` in `src/components/timeline/TimelineToolbar.tsx`. It renders specific filter dropdowns for timeline event types and date sorting; it has no purpose or reusability outside the Timeline view.

---

## Demo 7 — Reusable UI elements

### Tasks

#### 1. Extracted presentational components genuinely reused in multiple places: `Card` and `Badge`

We built **two** core reusable UI primitives in `src/components/common/` that standardize layout surfaces and categorical tags across the application without becoming a special-cased mess:

1. **`Card`** ([Card.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/common/Card.tsx)):
   - Reusable surface wrapper enforcing consistent borders, backgrounds, shadows, and rounded corners.
   - **Typed Props Interface:**
     ```tsx
     export interface CardProps {
       title?: string;
       className?: string;
       children: React.ReactNode;
     }
     ```
   - **Reused across 3 different feature contexts:**
     - [LocationCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/LocationCard.tsx) (People & Locations view)
     - [PersonCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonCard.tsx) (People & Locations view)
     - [CaseSummaryCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/dashboard/CaseSummaryCard.tsx) (Dashboard view)

2. **`Badge`** ([Badge.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/common/Badge.tsx)):
   - Reusable indicator chip standardizing status, certainty, and relevance labels across features.
   - **Typed Props Interface:**
     ```tsx
     export type BadgeVariant = 'reviewed' | 'critical' | 'flagged' | 'unreviewed' | string;

     export interface BadgeProps {
       variant?: BadgeVariant;
       className?: string;
       children: React.ReactNode;
     }
     ```
   - **Reused across 3 different feature contexts:**
     - [TimelineEventCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineEventCard.tsx) (Timeline view: certainty badges like `confirmed`, `contradictory`, `reported`).
     - [CaseSummaryCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/dashboard/CaseSummaryCard.tsx) (Dashboard view: case status badge like `OPEN`).
     - [RecentEvidenceList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/dashboard/RecentEvidenceList.tsx) (Dashboard view: evidence status badges like `reviewed`, `critical`, `unreviewed`).

---

### Questions

#### 1. Show the places your reusable components are used. What varies between them via props, and what stays fixed inside the component itself? How did you decide where that line goes?

**Places Used for Both Components:**
- **`Card`:**
  - `LocationCard.tsx`: `<Card className="location-card"> ... </Card>`
  - `PersonCard.tsx`: `<Card className="person-card"> ... </Card>`
  - `CaseSummaryCard.tsx`: `<Card className="case-summary-card"> ... </Card>`
- **`Badge`:**
  - `TimelineEventCard.tsx`: `<Badge variant={badgeClass}>{event.certainty}</Badge>`
  - `CaseSummaryCard.tsx`: `<Badge variant="flagged">{status}</Badge>`
  - `RecentEvidenceList.tsx`: `<Badge variant={getStatusBadgeClass(ev.status)}>{ev.status}</Badge>`

**What stays fixed inside each component:**
- **For `Card`:** The foundational panel styling (background token `var(--color-panel)`, default card class `.card`, border, and box-shadow containment) and the DOM wrapper structure.
- **For `Badge`:** The inline chip container (`.badge`), font sizing, padding, and the dynamic BEM-like class construction: `badge badge-${variant}` (with automatic prefix normalization).

**What varies via props:**
- **For `Card`:** `className` (allowing semantic modifiers like `.person-card` or `.location-card` for grid/flex sizing) and `children` (the internal arbitrary content).
- **For `Badge`:** `variant` (determining color themes like `badge-critical`, `badge-reviewed`, or `badge-flagged`) and `children` (the display label text).

**Where we drew the line:**
We drew the line at **visual primitives vs domain content**:
- If a concern belongs to the outer frame or generic styling rules, it stays fixed inside the component.
- If a concern represents domain-specific semantics, layout dimensions, or content, it is passed via props. Props avoid hardcoded assumptions about specific data structures.

---

#### 2. The original vanilla app had duplicated HTML-template code (the same card markup written out twice, slightly differently, in two functions). Compare that directly to what you just built. What does a reusable component give you that copy-pasted template strings didn't?

1. **Single Source of Truth vs. Maintenance Divergence:**
   - In vanilla `app.js`, when a card or badge template string was copy-pasted across `renderPeople()`, `renderLocations()`, and `renderTimeline()`, slight discrepancies crept in (different classes, missing ARIA attributes, forgotten closing tags).
   - If design tokens changed, every copy had to be manually hunted down and modified.
   - With reusable React components, updating `Card.tsx` or `Badge.tsx` updates every instance in the app instantly and consistently.
2. **Compile-Time Type Safety (TypeScript Contracts):**
   - In vanilla template strings, passing an invalid status or misspelling a class (`badge-flaged`) failed silently without any error or warning.
   - With `Badge.tsx`, TypeScript enforces `variant?: BadgeVariant`. Passing an invalid prop shape throws an immediate compile-time typecheck error.
3. **Encapsulated Accessibility and DOM Integrity:**
   - Template strings frequently introduce invalid HTML when concatenating unescaped variables.
   - A React component guarantees valid DOM hierarchy, automatic XSS string escaping, and consistent accessibility attributes out of the box.

---

## Demo 8 — Routing: People & Locations as real routes

### Tasks

#### 1. Installed React Router (`react-router-dom`) and replaced placeholder navigation shell with real routes

We installed `react-router-dom` (v7.18.4) and replaced the custom hash string parsing and `switch(currentView)` state toggle from Exercise 3 with declarative, standards-compliant client-side routing.

**Router Choice & Architectural Justification:**
- **Library:** `react-router-dom` was selected as the industry-standard client routing solution for React, providing declarative components (`<Routes>`, `<Route>`, `<NavLink>`, `<Link>`) and hooks (`useNavigate()`, `useLocation()`, `useParams()`, `useSearchParams()`).
- **Strategy:** We configured `<HashRouter basename="/react">` in [ReactApp.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/ReactApp.tsx).
  - *Coexistence with legacy Vanilla JS:* The ReMotion portal hosts legacy vanilla views (awaiting future migration) alongside modern React views on the exact same static page. Hash-based routing allows switching between `#vanilla-root` and `#react-root` seamlessly without making HTTP requests.
  - *Zero Server-Configuration Dependency:* Standard `BrowserRouter` uses HTML5 `history.pushState()`, which requires web server URL rewrite fallback rules (`try_files $uri /index.html`). Without rewrite rules, hard-refreshing a deep path like `/team/locations` on static hosting (e.g. GitHub Pages, static CDNs) yields a 404 HTTP error. `HashRouter` keeps all routing purely client-side behind the hash fragment (`#/react/...`), guaranteeing 100% bookmarkability and reloadability across any hosting environment.

**Configured Route Hierarchy in [`ReactApp.tsx`](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/ReactApp.tsx):**
```tsx
<Routes>
  {/* Root redirect */}
  <Route path="/" element={<Navigate to="/dashboard" replace />} />

  {/* Migrated Core Views */}
  <Route path="/dashboard" element={<DashboardView />} />

  {/* People & Locations Sub-Routes */}
  <Route path="/team" element={<Navigate to="/team/people" replace />} />
  <Route path="/team/*" element={<PeopleLocationsView onNavigateToEvidence={...} />} />

  {/* Backward-compatibility aliases */}
  <Route path="/people" element={<Navigate to="/team/people" replace />} />
  <Route path="/locations" element={<Navigate to="/team/locations" replace />} />

  {/* Timeline View */}
  <Route path="/timeline" element={<TimelineView />} />

  {/* Unmigrated Stubs (Exercise 5) */}
  <Route path="/evidence" element={<StubView viewId="evidence" ... />} />
  <Route path="/workspace" element={<StubView viewId="workspace" ... />} />

  {/* Wildcard 404 Catch-All */}
  <Route path="*" element={<NotFoundView />} />
</Routes>
```

---

#### 2. Converted People/Locations tab toggle from local state into real, bookmarkable routes

In [PeopleLocationsView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PeopleLocationsView.tsx), we eliminated internal `useState<'people' | 'locations'>` and replaced it with genuine nested routing:

```tsx
<div className="tabs" style={{ marginBottom: '1.5rem' }}>
  <NavLink
    to="/team/people"
    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
  >
    Personnel ({people.length})
  </NavLink>
  <NavLink
    to="/team/locations"
    className={({ isActive }) => `tab-btn ${isActive ? 'active' : ''}`}
  >
    Locations ({locations.length})
  </NavLink>
</div>

<Routes>
  <Route
    path="people"
    element={<PeopleList people={people} onViewEvidence={onNavigateToEvidence} />}
  />
  <Route path="locations" element={<LocationsList locations={locations} />} />
  <Route path="" element={<Navigate to="people" replace />} />
  <Route path="*" element={<Navigate to="people" replace />} />
</Routes>
```

- When the user visits `#/react/team/people`, the Personnel tab receives `.active` styling and `<PeopleList />` renders.
- When the user clicks the "Locations" tab, the URL updates to `#/react/team/locations`, and `<LocationsList />` renders without any page reload.
- The URL is now the single source of truth for the active tab.

---

### Questions

#### 1. Why does making the People/Locations tab a real route (versus keeping it as internal component state) matter for the user? Name a concrete capability the user gains.

Making the tab a real route elevates UI navigation from transient in-memory component state into the browser's native location contract:

1. **Direct Deep Linking & Shareability (Concrete Capability):**
   - An investigator analyzing facility layout L03 (Storage Room) can copy the exact address (`http://localhost:5173/#/react/team/locations`) and paste it to a team member in a chat or incident report.
   - When the colleague opens that link, the application immediately renders the **Locations** tab.
   - With transient `useState`, opening the shared link would default back to the initial state (`people`), forcing the colleague to manually click "Locations" again.
2. **Browser History & Back/Forward Navigation:**
   - Navigating from Personnel to Locations creates a distinct entry in the browser's session history.
   - If the user clicks "Back" (Alt + Left Arrow), the browser returns to the Personnel tab as expected, rather than discarding the entire view or taking the user away from the application.
3. **Resilience to Page Refreshes (F5):**
   - If the user is inspecting facility locations and accidentally refreshes the browser, the active tab is preserved by reading the URL, avoiding frustrating state resets.

---

#### 2. What does your router do when the URL doesn't match any route you've defined? Compare this to how the vanilla app's `handleHashChange()` fell back to the dashboard for an invalid hash.

1. **What Our Router Does:**
   - Our router registers a wildcard catch-all route at the bottom of the route tree: `<Route path="*" element={<NotFoundView />} />`.
   - When the user enters an unrecognized URL (e.g. `#/react/invalid-page-test`), the router catches it and renders [NotFoundView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/common/NotFoundView.tsx).
   - This view visually communicates the error with a `404 — View Not Found` banner, echoes the exact attempted path (`/invalid-page-test`) using `useLocation().pathname`, explains why the route failed, and provides a clear **Return to Dashboard** button.

2. **Comparison with Vanilla App's `handleHashChange()`:**
   - In vanilla `app.ts`, route resolution was handled by:
     ```ts
     if (!routes[view]) {
       view = 'dashboard';
     }
     ```
   - If a user navigated to `#unknown-view-xyz`, the vanilla app **silently fell back to the dashboard**.
   - **Problems with the Vanilla Approach:**
     - **Silent State Drift & URL Desynchronization:** The address bar remained `#unknown-view-xyz`, but the viewport displayed the dashboard without any explanation.
     - **Concealed Broken Links:** If an internal button had a typo in its hash link, developers and users had no obvious indication that the requested view was missing—it simply displayed the dashboard.
     - **User Confusion:** Users who typed or bookmarked an invalid URL could not determine whether the link was broken or whether the dashboard *was* the intended destination.
   - **The React Router Wildcard Advantage:**
     - Deterministic, explicit error handling.
     - The user is clearly notified that their destination does not exist and is given an intentional path back to safety.




---

## Demo 9 — Route parameters

### Tasks

#### 1. Added a parameterized route (`/team/people/:personId`) and dedicated profile component

We implemented a parameterized route in [PeopleLocationsView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PeopleLocationsView.tsx) to support deep-linking to individual team member profiles:

```tsx
<Routes>
  <Route
    path="people"
    element={<PeopleList people={people} onViewEvidence={onNavigateToEvidence} />}
  />
  <Route
    path="people/:personId"
    element={<PersonDetailView people={people} onViewEvidence={onNavigateToEvidence} />}
  />
  <Route path="locations" element={<LocationsList locations={locations} />} />
  <Route path="" element={<Navigate to="people" replace />} />
  <Route path="*" element={<Navigate to="people" replace />} />
</Routes>
```

We created [PersonDetailView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonDetailView.tsx) to consume this parameter using React Router's `useParams()` hook:
- Reads `const { personId } = useParams<{ personId: string }>();`
- Looks up the matching `person` entity from the loaded people array.
- Renders the person's detailed card, statement, responsibilities, evidence counts, and their extended **Background Dossier** (`person.background`).
- Provides a clean navigation link `← Back to all personnel` returning to `/team/people`.
- **Safe Fallback Guard:** If `personId` does not match any person in the dataset (e.g. `/team/people/unknown-id`), it gracefully renders a `Team Member Not Found` empty-state card with a recovery button, completely avoiding runtime null/undefined reference errors.

---

#### 2. Added deep links across the application to the parameterized route

We connected the application so users can navigate to these parameterized routes naturally without typing URLs by hand:

1. **From Person Cards ([PersonCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonCard.tsx)):**
   - In the general personnel directory (`/team/people`), each card's title and a dedicated `View Dossier →` button link directly to `/team/people/${person.id}`.
2. **From the Incident Timeline ([TimelineEventCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineEventCard.tsx) & [TimelineList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineList.tsx)):**
   - Each chronological timeline event checks its associated `personIds`.
   - In [TimelineList.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineList.tsx), each ID is resolved to a person entity using `findPersonById()`.
   - In [TimelineEventCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineEventCard.tsx), we display:
     ```tsx
     {persons.length > 0 && (
       <p className="evidence-meta">
         Involved personnel:{' '}
         {persons.map((person, idx) => (
           <span key={person.id}>
             {idx > 0 && ', '}
             <Link
               to={`/team/people/${person.id}`}
               title={`View profile for ${person.name}`}
             >
               {person.name}
             </Link>
           </span>
         ))}
       </p>
     )}
     ```
   - Investigators reviewing timeline incidents (e.g. Server Room access, firmware deployments) can directly click any involved person's name to jump straight to their individual profile and statement.

---

### Questions

#### 1. How do you read a route parameter's value inside your component, and what type is it as far as TypeScript is concerned by default? What did you have to do to use it safely (e.g. what if the id in the URL doesn't match any real person)?

1. **How we read the route parameter:**
   Inside [PersonDetailView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonDetailView.tsx), we use the `useParams` hook exported by `react-router-dom`:
   ```tsx
   import { useParams } from 'react-router-dom';

   const { personId } = useParams<{ personId: string }>();
   ```

2. **Default TypeScript Type:**
   By default, `useParams()` returns `Params<string>`, which TypeScript resolves as `Record<string, string | undefined>`.
   Even when using generic typing like `useParams<{ personId: string }>()`, `personId` has the type **`string | undefined`**.
   TypeScript intentionally makes every route param optional/possibly undefined because the component could be rendered outside a route matching that parameter, or the parameter might fail to match.

3. **What we had to do to use it safely:**
   - **Step A — Existence check & Lookup:** We ensure `personId` is provided before performing array lookup:
     ```tsx
     const person = personId ? people.find((p) => p.id === personId) : undefined;
     ```
   - **Step B — Guard against missing or invalid IDs:** If `person` is `undefined` (because someone entered a non-existent ID like `/team/people/ghost-user`), we do **not** attempt to access properties like `person.name` or `person.role` (which would trigger fatal `TypeError: Cannot read properties of undefined` crashes). Instead, we return an explicit, user-friendly fallback view:
     ```tsx
     if (!person) {
       return (
         <div className="card empty-state">
           <h3>Team Member Not Found</h3>
           <p>No team member found with identifier <code>{personId}</code>.</p>
           <Link to="/team/people" className="btn btn-primary">
             ← Back to all personnel
           </Link>
         </div>
       );
     }
     ```

---

#### 2. What's the practical difference, for the user, between `/team/people/nova-byte` (a route param) and `/team/people?person=nova-byte` (a query param)? Why is one more appropriate than the other for this specific case?

1. **Practical difference for the user:**
   - **Route Parameter (`/team/people/nova-byte`):**
     - Represents the **canonical identity of a specific, distinct resource** (a noun in the application hierarchy).
     - The user expects a dedicated page or focused view showing the entity itself (Nova Byte's dossier, background, statements, and specific metadata).
     - It creates a hierarchical mental model: `Application > Team > People > Nova Byte`.
   - **Query Parameter (`/team/people?person=nova-byte`):**
     - Represents a **filter, search parameter, or state modifier applied over a collection**.
     - The user expects to remain in the general directory or list view, but with the list filtered to show items matching "nova-byte".
     - Query parameters are typically optional, composable (`?person=nova-byte&sort=asc&role=lead`), and can be omitted without changing the core nature of the page.

2. **Why a Route Parameter is more appropriate for this specific case:**
   - When an investigator clicks to inspect a specific person, they want to view that person's individual profile, statements, and background dossier, rather than a filtered search result of the team directory.
   - RESTful URL conventions dictate that individual resources take path parameters (`/people/:id`), whereas query parameters (`?filter=...`) are reserved for collection filtering and sorting (which is exactly what we use next in Demo 10 for filtering timeline events).

---

## Demo 10 — Query parameters as URL state + migration wrap-up

### Tasks

#### 1. Parameterized Timeline initial render using URL query parameters (`?person=...`)

In [TimelineView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineView.tsx), we used React Router's `useSearchParams()` hook to read query parameters on page load:

```tsx
const [searchParams] = useSearchParams();
const personQuery = searchParams.get('person') || propPersonFilter;
const locationQuery = searchParams.get('location') || '';
const typeQuery = searchParams.get('type') || '';
const initialOrder = (searchParams.get('order') as 'asc' | 'desc') || 'asc';

// Parameterize initial render based on URL query parameters
let filtered = events;
if (personQuery) {
  filtered = filtered.filter((e) => e.personIds && e.personIds.includes(personQuery));
}
if (locationQuery) {
  filtered = filtered.filter((e) => e.locationIds && e.locationIds.includes(locationQuery));
}
if (typeQuery) {
  filtered = filtered.filter((e) => e.type === typeQuery);
}
```

- When an investigator opens `http://localhost:5173/#/react/timeline?person=dr-elena-rostova`:
  1. The initial timeline list only renders events involving Dr. Elena Rostova.
  2. The dropdown `<select id="timelinePersonFilter">` in [TimelineToolbar.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineToolbar.tsx) receives `selectedPerson={personQuery}` and reflects "Dr. Elena Rostova".
  3. In [PersonDetailView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonDetailView.tsx), we provided a direct deep link: `<Link to={`/timeline?person=${person.id}`}>Timeline Activity →</Link>`.
- **Constraint respected:** The filter controls themselves do not manage mutable state or wire `onChange` handlers yet. The initial render is purely parameterized from the URL.

---

#### 2. Final verification pass across migrated views

We conducted a thorough audit across the migrated application code:

1. **Fully React (Zero Manual DOM / `innerHTML`):**
   - Verified that `src/components/` contains **0 occurrences** of `innerHTML`, `outerHTML`, or `document.createElement()`.
   - Every UI element is rendered using declarative JSX and React component composition.
2. **All Migrated Views Reachable via Bookmarkable Routes:**
   - **Dashboard:** `/#/react/dashboard`
   - **Personnel Directory:** `/#/react/team/people`
   - **Person Dossier (Parameterized Route):** `/#/react/team/people/:personId`
   - **Facility Locations:** `/#/react/team/locations`
   - **Chronological Timeline:** `/#/react/timeline` (and `/#/react/timeline?person=...`)
   - **Unrecognized Routes (404 Fallback):** Wildcard catch-all renders `<NotFoundView />`.
   - **Unmigrated Views (Stubs):** `/#/react/evidence` and `/#/react/workspace` render informative `<StubView />` containers that bridge to the legacy vanilla views for Exercise 5.
3. **Clean Architecture & Folder Separation:**
   - Feature-based structure (`common/`, `dashboard/`, `people_locations/`, `timeline/`) cleanly separates concerns and prevents monolithic coupling.
   - Core reusable primitives (`Card`, `Badge`) are shared across 3+ feature contexts without leaking domain logic.

---

### Questions

#### 1. Why is reading a query parameter once, on initial render, still consistent with this exercise's "no state beyond what's necessary to render the initial view" rule? What would cross the line into "real interactivity" that's out of scope until Exercise 5?

1. **Why reading a query parameter on initial render is consistent:**
   - A URL query parameter is **external input** provided to the component tree at mount time, fundamentally identical to an incoming `prop`.
   - The initial render calculation is a pure, idempotent projection:
     $$\text{Initial UI} = f(\text{Data}, \text{URL Query})$$
   - It does not introduce mutable client-side state, event handling loops, or asynchronous state synchronization. It simply answers: *"Given this URL, what should the initial screen show?"*

2. **What would cross the line into "real interactivity" (reserved for Exercise 5):**
   - **Wiring `onChange` Event Listeners:** Attaching handlers to the `<select>` and `<input>` elements that intercept user clicks and keystrokes.
   - **Local State Mutations (`useState`):** Updating state variables on every selection (`setPersonFilter(newVal)`), causing React to re-render the view in response to user events.
   - **Two-Way URL Synchronization (`setSearchParams`):** Imperatively updating the browser address bar as the user interacts with the UI (`setSearchParams({ person: selectedId })`).
   - **Search Input Debouncing and Form Validation:** Buffering keystrokes, clearing inputs, and managing dirty/pristine form flags.

---

#### 2. What would you need to add to make Timeline's filters *actually* filter the list when a user changes them? (You don't have to build it. Just name the concepts you'd need)

To make Timeline's filters interactive, we would need:

1. **State Management (`useState` or URL Search Params State):**
   - State variables to store current filter selections:
     ```tsx
     const [personFilter, setPersonFilter] = useState(initialPerson);
     const [locationFilter, setLocationFilter] = useState('');
     const [typeFilter, setTypeFilter] = useState('');
     ```
2. **Synthetic Event Handlers (`onChange`):**
   - Event callbacks passed to the `<select>` dropdowns in `TimelineToolbar`:
     ```tsx
     <select onChange={(e) => setPersonFilter(e.target.value)}>
     ```
3. **Reactive Re-filtering (Derived State):**
   - A reactive pipeline (optionally memoized via `useMemo`) that recalculates the displayed list whenever any filter state variable updates:
     ```tsx
     const visibleEvents = useMemo(() => {
       return events.filter(e => matchesFilters(e, personFilter, locationFilter, typeFilter));
     }, [events, personFilter, locationFilter, typeFilter]);
     ```
4. **URL Synchronization (Optional Modern UX):**
   - Calling `setSearchParams()` inside the change handlers so active filter states remain shareable and survive page refreshes.

---

#### 3. Across the 3 views you've now fully migrated, what's one piece of duplicated logic or markup you noticed but didn't extract yet? Why didn't you, and would you if you had more time?

1. **Duplicated Markup / Logic Noticed:**
   - **Standardized View Header Layout:**
     In all three migrated views (`DashboardView`, `PeopleLocationsView`, `TimelineView`), there is an identical top header block:
     ```tsx
     <div className="view-header">
       <h2>{title}</h2>
       <p className="view-subtitle">{description}</p>
     </div>
     ```
   - **Evidence Quick-View Action Buttons:**
     Both `TimelineEventCard` and `PersonCard` construct buttons linking to evidence IDs (`View E01`, `View E02`) using an `onViewEvidence` callback.
   - **Empty State Display Blocks:**
     `TimelineList`, `PeopleList`, `LocationsList`, and `PersonDetailView` each author slightly different empty-state DOM wrappers (`<div className="empty-state"><p>...</p></div>`).

2. **Why we didn't extract it yet:**
   - **Avoiding Premature Abstraction (Rule of Three & YAGNI):** When migrating views step-by-step, rushing to create generic wrappers before knowing the full requirements of remaining views (Evidence Locker and Investigator Workspace in Exercise 5) leads to leaky abstractions with overly complex prop configurations.
   - **Preserving Semantic Simplicity:** Simple HTML headings (`<h2>`, `<p className="view-subtitle">`) are clear, readable, and standard. Abstracting a 3-line heading block into a `<ViewHeader />` component adds indirection without substantial code savings.

3. **Would we extract it with more time?**
   - **Yes, for `<EmptyState />`:** Extracting an `<EmptyState icon={...} title={...} message={...} action={...} />` component would be highly beneficial. It would ensure consistent padding, muted typography, icon sizing, and accessibility ARIA roles across all presentational lists.
   - **Yes, for Evidence Quick-View Links:** In Exercise 5, when the evidence modal is fully wired, extracting a shared `<EvidenceLinkButton evidenceId={...} onClick={...} />` component will ensure uniform badges and click tracking.
