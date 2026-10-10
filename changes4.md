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
