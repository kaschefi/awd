# Exercise 4 — React UI & Component Design

## Demo 1 — JSX, function components, typed props, composition & children

### Tasks

#### 1. Built 3 small components with explicitly typed props for People & Locations and Timeline

We created three focused, presentational components for the views being migrated:

1. **`PersonCard`** ([PersonCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonCard.tsx)):
   - Renders a team member's avatar, name, role, speciality, responsibilities list, quote statement, and associated evidence count.
   - Props interface:
     ```tsx
     export interface PersonCardProps {
       person: Person;
       evidenceCount?: number;
       onViewEvidence?: (personId: string) => void;
     }
     ```
2. **`LocationCard`** ([LocationCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/LocationCard.tsx)):
   - Renders a facility area (ID, display name, description, and list of contained assets/equipment).
   - Props interface:
     ```tsx
     export interface LocationCardProps {
       location: Location;
     }
     ```
3. **`TimelineEventCard`** ([TimelineEventCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/timeline/TimelineEventCard.tsx)):
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

We created **`Card`** ([Card.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/common/Card.tsx)):
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
Inside both [LocationCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/LocationCard.tsx) and [PersonCard.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/people_locations/PersonCard.tsx), rather than hardcoding repetitive panel markup or passing raw text as rigid data props, both components compose their inner layout by placing their unique elements directly as `children` of `<Card>`:

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

