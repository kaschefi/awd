# Project Architecture & Component Structure

## Feature-Oriented React Architecture

The React migration of the Project ReMotion Investigation Portal is structured by **features and domains** rather than technical file types:

```
src/
├── components/
│   ├── common/                  # Shared presentational UI primitives & app shell
│   │   ├── Card.tsx             # Generic card surface supporting children composition
│   │   ├── Header.tsx           # Global header navigation and brand banner
│   │   ├── Footer.tsx           # Persistent portal footer
│   │   ├── NotFoundView.tsx     # 404 fallback view for unrecognized routes
│   │   └── StubView.tsx         # Placeholder view for unmigrated legacy pages
│   ├── dashboard/               # Case Dashboard feature domain
│   │   ├── CaseSummaryCard.tsx
│   │   ├── DashboardView.tsx
│   │   ├── HowToUsePortal.tsx
│   │   ├── RecentEvidenceList.tsx
│   │   ├── RecentTimelineList.tsx
│   │   ├── ReviewProgress.tsx
│   │   ├── StatCard.tsx
│   │   └── StatGrid.tsx
│   ├── people_locations/        # Personnel & Facility Locations feature domain
│   │   ├── LocationCard.tsx
│   │   ├── LocationsList.tsx
│   │   ├── PeopleList.tsx
│   │   ├── PeopleLocationsView.tsx
│   │   └── PersonCard.tsx
│   └── timeline/                # Chronological Investigation Timeline feature domain
│       ├── TimelineEventCard.tsx
│       ├── TimelineList.tsx
│       ├── TimelineToolbar.tsx
│       └── TimelineView.tsx
├── hooks/
│   └── usePortalData.ts         # Reactive data hook bridging vanilla async state to React
├── types/
│   └── navigation.ts            # View routing keys and navigation contracts
├── dataLoader.ts                # Asynchronous JSON fetchers
├── formatters.ts                # Date and badge class formatting helpers
├── lookup.ts                    # Entity resolution utilities
└── ReactApp.tsx                 # Root application container & coexistence router
```

## The Separation Rule: "Shared" vs. "Feature-Local"

We apply a strict decision rule to determine whether a component belongs in `common/` or a feature directory:

1. **Shared (`src/components/common/`):**
   - **General Purpose:** The component knows nothing about specific investigation domain concepts (such as Evidence IDs, suspects, or timeline events).
   - **Multi-Feature Usage:** The component is designed to be used across two or more unrelated features or provides global layout shell structure (`Card`, `Header`, `Footer`).
   - **Zero Domain Coupling:** It receives all content via generic props or `children`.

2. **Feature-Local (`src/components/<feature_name>/`):**
   - **Domain Specific:** The component is tightly coupled to a single business capability (`PersonCard` understands `Person`, `TimelineEventCard` understands `TimelineEvent`).
   - **Colocation:** All subcomponents, toolbars, and list views that exist solely to support that feature live inside that feature's directory.
   - **Isolated Refactoring:** If the Timeline feature is modified or replaced, changes are completely confined to `src/components/timeline/` without side effects on Dashboard or People & Locations.
