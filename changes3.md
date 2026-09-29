# Exercise 3 — React Foundations & First Migration

## Demo 1 — Historical view of the web

### Tasks

#### 1. Concise explanation of how web applications evolved over the years
Web applications evolved through several distinct eras over the last 30+ years:

1. **Static Document Web (Early 1990s — Web 1.0):**
   - The web began as linked hypertext documents (HTML).
   - Pages were static files hosted on a server. Every click requested a brand new document over HTTP, leading to a complete browser refresh.
2. **Server-Side Rendered (SSR) Multi-Page Applications / Classic MPAs (Late 1990s – Early 2000s):**
   - Technologies like PHP, CGI/Perl, ASP, and Java Servlets/JSP allowed the server to dynamically generate HTML per request from database queries.
   - However, the interaction model remained synchronous: every form submission or link click triggered a full request-response cycle, resulting in a white screen flash and full page reconstruction by the browser.
3. **The AJAX & DOM Manipulation Era (Mid 2000s, ~2005–2009):**
   - In 2005, Jesse James Garrett coined "AJAX" (Asynchronous JavaScript and XML). The browser's `XMLHttpRequest` enabled sending and receiving data in the background without refreshing the page.
   - Groundbreaking apps like Google Maps (panning/zooming smoothly) and Gmail proved the web could feel like desktop software.
   - Libraries like jQuery (2006) simplified cross-browser DOM queries, event handling, and AJAX calls, but logic was mostly imperative and scattered across DOM elements.
4. **Early Single-Page Applications (SPAs) & Hash Routing Era (Late 2000s – Early 2010s, ~2010–2013):**
   - JavaScript moved from being a decorative enhancement to managing the entire user interface and application lifecycle in the client.
   - The server served an empty HTML "shell", while client-side JavaScript fetched JSON data and rendered templates.
   - To navigate without triggering full page reloads in browsers that lacked HTML5 History API support, developers used hash-based routing (`#dashboard`, `#/evidence`). Frameworks like Backbone.js (2010), Knockout.js (2010), and AngularJS (2010) appeared to help structure client-side state and view rendering.
5. **Declarative Component-Based SPA Era (Mid 2010s, ~2013–2018):**
   - As client-side apps grew in complexity, direct imperative DOM manipulation (`innerHTML`, jQuery) became a major maintenance bottleneck.
   - React introduced a declarative programming model: UI as a function of state (`UI = f(state)`), unidirectional data flow, a Virtual DOM with automatic diffing/reconciliation, and component composition. Modern client routers also transitioned to the HTML5 History API (`pushState`).
6. **Modern Hybrid & Meta-Framework Era (Late 2010s – Present):**
   - Modern web development addresses the downsides of pure CSR (slow initial page loads, heavy JS bundles, poor SEO) through hybrid architectures like Next.js, Remix, Astro, and React Server Components (RSC).
   - Combines the fast initial render of server rendering with the fluid interactivity of client-side component hydration.

---

#### 2. Placing our exercise application on the timeline & Justification
- **Where our app sits:**
  Conceptually and architecturally, our app sits in the **Early / Transitional Client-Side SPA era (circa 2010–2012)**, even though it is authored using modern 2020s tooling (TypeScript, Vite, ES Modules).
- **Justification:**
  1. **Hash-Based Routing (`#dashboard`, `#evidence`):** The app uses `window.location.hash` and the `hashchange` event listener to switch views without reloading the page. This was the exact hallmark pattern of early 2010s SPAs (like Backbone.js or early AngularJS) before HTML5 `history.pushState` was widely adopted and before servers were configured with SPA fallback rewrites.
  2. **Imperative DOM Replacement (`innerHTML` injection):** To switch views, `handleHashChange()` dynamically imports raw HTML strings (`import('./pages/.../index.html?raw')`) and assigns them directly to `appContainer.innerHTML`. It then manually executes `module.init()`. This is manual, imperative DOM manipulation rather than a declarative component tree.
  3. **Ad-Hoc Global Client State:** State (`allEvidence`, `allPeople`, `currentPage`, etc.) is maintained in an in-memory mutable singleton object (`state.ts`), with selective persistence in `localStorage`. This is typical of early client-side architecture before modern state managers or React hooks took over.
  4. **Client-Side Rendering (CSR):** The server delivers a static shell (`index.html`) with an empty `<main id="app">`. The browser must download the bundle, execute `app.ts`, fetch the JSON files asynchronously (`fetchEvidenceData()`, etc.), and populate the DOM before the user sees any data.

---

### Questions

#### 1. What specific problem was AJAX (and libraries like jQuery) solving that plain server-rendered pages couldn't? What new problems did that approach introduce, that SPA frameworks then tried to solve?

- **Problems AJAX and jQuery solved:**
  - **Eliminating full page reloads:** Plain server-rendered pages required a round-trip to the server for any update (e.g. submitting a comment, paginating a list, or filtering items). The browser discarded the current page, flashed white, and re-parsed and re-rendered the entire HTML document.
  - **Fluid, desktop-like user experience:** AJAX allowed requesting small pieces of data (or HTML snippets) asynchronously in the background. Only the specific portion of the UI that changed was updated, preserving scroll position, form inputs, and UI focus.
  - **Cross-browser inconsistencies:** jQuery solved the fragmentation between Internet Explorer, Firefox, and Safari by offering a unified API for selecting elements, handling events, and making HTTP requests (`$.ajax`).

- **New problems that approach introduced:**
  - **"Spaghetti DOM" and out-of-sync state:** Because jQuery directly manipulated DOM elements imperatively (`$('#count').text(newVal)`, `$('.item').addClass('active')`), the DOM itself became the source of truth ("the DOM as the database"). As applications grew, keeping the DOM synchronized with underlying data across multiple disparate event handlers became fragile and error-prone.
  - **Broken browser history and back button:** Making AJAX requests didn't update the browser's address bar. Users clicking the browser's "Back" or "Forward" buttons were taken away from the site entirely or lost their view state. Deep-linking and bookmarking a specific view was impossible without custom logic.
  - **Memory leaks & listener accumulation:** Constantly adding and replacing elements dynamically with jQuery often left orphaned event listeners in memory, degrading browser performance over time.
  - **Lack of architectural structure:** There was no standard way to structure code, leading to massive monolithic script files where networking, business logic, and DOM manipulation were deeply tangled.

- **How SPA frameworks solved these:**
  - **Client-Side Routers:** Synchronized URL changes with application views (using hashes or History API) so bookmarking and browser back/forward buttons worked naturally.
  - **Data-Driven Declarative Rendering:** Decoupled data from the DOM. Data became the single source of truth, and the UI automatically re-rendered based on state (`UI = f(state)`).
  - **Component Architecture & Lifecycle:** Encapsulated markup, behavior, and styling into isolated components with clear setup and teardown lifecycles.

---

#### 2. This app currently uses hash-based routing (`#dashboard`, `#evidence`, ...) with no full page reload between views. Which era does that pattern belong to, and what does it tell you about when this architectural choice became common?

- **Which era it belongs to:**
  - Hash-based routing belongs to the **early Single-Page Application (SPA) era (approx. 2008–2013)**.
  - It was the standard routing strategy used by early client-side libraries and frameworks such as **Backbone.js**, **Sammy.js**, and **AngularJS 1.x** (which popularized the `#/` hashbang / hash route pattern).

- **What it tells us about when and why this architectural choice became common:**
  - **The technical limitation of early browsers:** Historically, any change to the path in the address bar (e.g., from `domain.com/dashboard` to `domain.com/evidence`) caused the browser to issue an HTTP GET request to the server, resulting in a full page reload. Older browsers (like Internet Explorer 8 and 9) did not support the HTML5 History API (`history.pushState` and `history.replaceState`), which wasn't standardized or universally available until around 2012–2014.
  - **The nature of the URL hash fragment:** The hash portion of a URL (anything after `#`) is an anchor originally designed for jumping to elements on the same page. Crucially, **the hash fragment is never sent to the web server in an HTTP request**. Changing the hash via `window.location.hash = 'evidence'` alters the URL and fires the client-side `hashchange` event without triggering an HTTP request or page reload.
  - **No server configuration required:** A traditional path route (`/evidence`) requires the web server (e.g., Nginx, Apache) to have URL rewriting rules (fallback to `/index.html`) so refreshing the page doesn't yield a 404 error. In contrast, hash routing works on **any** static file server or local file system (`file:///...`) out-of-the-box because the server always serves `index.html` regardless of the hash.
  - **Conclusion:** This tells us that hash-based routing became common during the transitional period when developers wanted client-side navigation without page reloads across all user browsers, before HTML5 pushState was ubiquitous and before single-page server rewrite conventions were standard.

---

## Demo 2 — SSR vs. CSR

### Tasks

#### 1. Comparison Table: Server-Side Rendering (SSR) vs. Client-Side Rendering (CSR)

| Dimension | Server-Side Rendering (SSR) | Client-Side Rendering (CSR) |
|---|---|---|
| **First Request: Server Sends** | A complete, fully formed HTML document containing all data, text, and structure already rendered in markup, plus linked stylesheets and optional scripts. | A minimal, mostly empty HTML "shell" (e.g. `<main id="app"></main>`), linked stylesheets, and `<script>` tags referencing JS bundle(s). No actual data or view content. |
| **Browser Action Before Content is Visible** | 1. Downloads HTML & CSS.<br>2. Builds DOM & CSSOM.<br>3. **Immediately paints visible content** (Fast First Contentful Paint — FCP).<br>*(Optional: downloads JS to hydrate event listeners).* | 1. Downloads HTML shell.<br>2. Downloads JavaScript bundles.<br>3. Parses, compiles, and executes JS.<br>4. Dispatches async network requests (`fetch`) for JSON data.<br>5. Waits for API responses.<br>6. Assembles DOM nodes in memory and mounts them.<br>7. Content finally appears (Slower FCP/TTI). |
| **Subsequent Navigation (Page Switch)** | Classic MPA: Issues a new HTTP GET request to the server; browser unloads current document, flashes white, and reconstructs the new HTML from scratch.<br>*(Modern SSR frameworks like Next.js emulate SPA routing by fetching data/RSC chunks client-side).* | No full reload. The client router intercepts the URL change (hash or `pushState`). Existing DOM is preserved; only the relevant view container is updated or re-rendered with new data/components. |
| **Search Engine Optimization (SEO)** | Excellent out-of-the-box. Web crawlers and scrapers receive complete HTML containing all content immediately without needing to execute JavaScript. | Requires search engine bots to run full headless browser JS execution and wait for asynchronous waterfalls. Can cause indexing delays or missed content. |
| **Server Load & Infrastructure** | Higher server CPU overhead. The server must query databases and construct HTML strings for every incoming request (mitigated by caching/CDNs). | Extremely low server load. The server only serves static assets (HTML, JS, CSS, JSON). Easily distributed globally on low-cost CDNs/edge storage. |
| **Client Device Requirements** | Lightweight. Even low-powered smartphones or smart TVs can quickly parse and display static HTML without heavy CPU or memory usage. | Demanding. The client device's CPU and memory must parse and execute large JS bundles, run data filtering, and perform DOM mutations. |

- **What the server sends on first request:**
  - In **SSR**, the server fetches the data and renders the complete markup before sending anything to the client. When the HTTP response arrives at the browser, the raw response body already contains the text, tables, and lists.
  - In **CSR**, the server is agnostic of page content. It delivers a generic template (an HTML skeleton with `<div id="root">` or `<main id="app">`). The actual application content does not exist on the server.
- **What the browser must do before the user sees content:**
  - In **SSR**, the browser constructs the DOM tree from the received HTML and renders it directly. The user can read content almost immediately.
  - In **CSR**, the browser cannot display content upon receiving the HTML. It enters a "waterfall": it must parse the HTML, request the JS bundle, compile the JS, execute the JS, issue asynchronous `fetch()` requests for JSON data, wait for network responses, and then programmatically build and insert HTML into the DOM.
- **What happens on subsequent navigation:**
  - In **classic SSR**, every link click is a brand-new navigation: the browser tears down the existing window, issues an HTTP request, and waits for a full new HTML document.
  - In **CSR**, subsequent clicks do not trigger full page reloads. A client-side router intercepts the action, keeps the surrounding layout (header, footer, sidebar) untouched, and dynamically updates only the main view by rendering new components or injecting HTML snippets into the container.

---

#### 2. Real-World Website Analysis & Observable Evidence

To demonstrate SSR vs. CSR live, we can examine two well-known production websites using standard browser DevTools:

##### Website A: Wikipedia (https://en.wikipedia.org) — Primarily SSR (Classic Server-Rendered)
- **Observable Evidence 1: "View Page Source" (`Ctrl + U`)**
  - Right-click any Wikipedia article (e.g. `https://en.wikipedia.org/wiki/Web_application`) and select *View Page Source*.
  - Search for any paragraph sentence, heading, or citation.
  - **Result:** Every single word and heading is present directly in the raw HTML delivered by the server. The server constructed the complete document using PHP/MediaWiki before sending it over the wire.
- **Observable Evidence 2: Disable JavaScript in DevTools**
  - Open DevTools (`F12`), press `F1` (or click settings), and check **"Disable JavaScript"**.
  - Reload the Wikipedia page.
  - **Result:** The article renders identically. All text, tables, infoboxes, and references appear immediately. Hyperlinks to other articles still work, navigating seamlessly between server-rendered pages.
- **Observable Evidence 3: Network Tab Inspection**
  - Open DevTools *Network* tab and reload with JS enabled.
  - The first entry (`Web_application`, type `document`) has a transfer size of ~100+ KB. Clicking on its *Response* tab reveals the complete article content inside standard HTML tags (`<h1>`, `<p>`, `<table>`). No subsequent XHR/Fetch calls are required to read the text.

##### Website B: Spotify Web Player (https://open.spotify.com) — Primarily CSR (Single-Page Application)
- **Observable Evidence 1: "View Page Source" (`Ctrl + U`)**
  - Right-click the Spotify Web Player and select *View Page Source*.
  - Search for artist names, playlist titles, or track names visible on screen.
  - **Result:** None of them exist in the source HTML. The `<body>` contains only `<div id="main"></div>` (or `<div id="root"></div>`) along with a list of `<script src="...">` tags pointing to compiled Webpack/Vite chunks.
- **Observable Evidence 2: Disable JavaScript in DevTools**
  - Open DevTools, check **"Disable JavaScript"**, and reload `https://open.spotify.com`.
  - **Result:** The screen stays completely blank, or shows a static fallback message stating *"Please enable JavaScript to use Spotify"*. The application cannot render a single song, button, or album art without the JavaScript engine running.
- **Observable Evidence 3: Network Tab Inspection**
  - Open the *Network* tab and filter by `Fetch/XHR`.
  - Upon loading, the initial `document` request is tiny (a minimal HTML shell). Immediately following, you see a flurry of JavaScript bundle downloads, followed by numerous asynchronous XHR/Fetch API calls to Spotify's backend endpoints (e.g. `/v1/me`, `/v1/views/desktop-home`) returning JSON payloads. Only after these JSON payloads resolve does the client-side code render the music cards and sidebar into the DOM.

---

### Questions

#### 1. Explain why this exercise application is SSR or CSR and why. Walk through, step by step, what happens between the browser requesting the page and the Dashboard actually being visible.

- **Why this exercise application is pure CSR:**
  1. **Empty Shell in Source HTML:** Looking at `src/index.html` (lines 68–70), the main content area is literally `<main id="app"></main>`. There is zero HTML for the dashboard, no case title, no stat cards, no evidence entries, and no timeline items.
  2. **Rendering Execution:** All markup inside `<main id="app">` is constructed at runtime in the client's browser by `app.ts` injecting HTML strings (`appContainer.innerHTML = htmlModule.default`) and `pages/dashboard/script.js` executing DOM mutations.
  3. **Data Fetching:** The server only serves raw JSON files (`case.json`, `evidence.json`, etc.). It never combines data with HTML templates on the backend.

- **Step-by-step walkthrough from initial request to visible Dashboard:**
  1. **Step 1 — HTTP GET for HTML:** The user enters `http://localhost:5173/` in the browser. The browser sends an HTTP GET request to the Vite development server.
  2. **Step 2 — Server returns static shell:** The server returns `src/index.html`. This document contains only the persistent `<header>`, the loading overlay `<div id="loadingOverlay">`, the empty `<main id="app"></main>`, and a module script tag `<script type="module" src="app.ts"></script>`.
  3. **Step 3 — HTML parsing & script discovery:** The browser parses `index.html`, constructs the initial DOM tree, and encounters `<script type="module" src="app.ts">`. The browser pauses full rendering of the application body and sends HTTP requests for `app.ts` and its ES module imports (`state.js`, `dataLoader.js`, `lookup.js`, `formatters.js`).
  4. **Step 4 — Script execution & App initialization (`DOMContentLoaded`):**
     - When the DOM is ready, `initApp()` in `app.ts` executes.
     - It reads saved bookmarks and notes from the browser's `localStorage` (`loadBookmarksFromStorage()`, `loadNotesFromStorage()`).
     - It calls `showLoadingOverlay('Loading case file…')`, which removes the `.hidden` class from `#loadingOverlay`. The user sees the animated spinner and loading message, but no application content yet.
  5. **Step 5 — Asynchronous data fetching waterfall:**
     - `loadAllData()` is invoked, setting `state.loadingStepsRemaining = 2`.
     - It initiates multiple asynchronous HTTP `fetch()` requests across the network:
       - `loadCorePeopleAndLocations()` fetches `case.json`, `people.json`, and `locations.json`. When done, it decrements `loadingStepsRemaining`.
       - `loadEvidenceData()` fetches `evidence.json` independently, applies stored bookmark flags, and resets `evidenceViewLoading = false`.
       - `loadTimelineData()` fetches `timeline.json`. Upon completion, it decrements `loadingStepsRemaining`.
  6. **Step 6 — Loading overlay teardown & Routing:**
     - When `loadingStepsRemaining` reaches 0, `hideLoadingStep()` adds the `.hidden` class back to `#loadingOverlay`.
     - `loadAllData().then(...)` calls `handleHashChange()`.
     - `handleHashChange()` reads `window.location.hash`. Since the initial URL has no hash (or `#dashboard`), it defaults `view` to `'dashboard'` and sets `state.currentPage = 'dashboard'`.
     - It toggles the `.active` class on the Header navigation buttons so the "Dashboard" button is highlighted.
  7. **Step 7 — Dynamic view template fetching and injection:**
     - `targetRoute.loadHtml()` dynamically fetches the dashboard HTML snippet using Vite's `import('./pages/dashboard/index.html?raw')`.
     - Once the string resolves, it assigns it to the DOM: `appContainer.innerHTML = htmlModule.default`.
     - It finds the injected `<section class="view">` and adds the `.active` class to make it visible according to `styles.css`.
  8. **Step 8 — Dynamic view module execution:**
     - `targetRoute.loadModule()` dynamically imports `pages/dashboard/script.js`.
     - It executes the exported `init()` function of the dashboard.
  9. **Step 9 — Client-side DOM population:**
     - `dashboard/script.js`'s `init()` reads the loaded data from `state` (`state.caseData`, `state.allEvidence`, `state.allTimeline`).
     - It computes derived values: count of evidence, count of active leads, count of timeline events, and review progress percentage.
     - It imperatively updates DOM nodes: sets `#caseTitle.textContent`, populates `#statEvidence`, `#statLeads`, `#statTimeline`, updates the progress bar `#reviewProgressBar`, and renders the HTML lists for `#timelineRecentList` and `#evidenceRecentList`.
  10. **Step 10 — Dashboard visible:** The user now sees the fully populated, interactive Dashboard.

---

#### 2. Name one real cost of what the architecture pays for that choice (think about what a user with JavaScript disabled, or a slow connection, or a search engine crawler would see) and why.

- **Primary Cost: Total dependency on JavaScript execution (Blank Screen Failure)**
  - **What happens:** If a user has JavaScript disabled in their browser (due to strict security/privacy configurations, Tor browser, or corporate group policies) or if an adblocker/network glitch blocks `app.ts` from loading:
    - The user is left staring at an empty page with only a static header and a permanently stuck loading spinner (`#loadingOverlay`).
    - Unlike an SSR architecture where the case details, evidence table, and summary are plain HTML readable by anyone, **in CSR there is zero content delivered without JavaScript**. The failure is total and catastrophic rather than graceful degradation.

- **Additional Real-World Costs Paid by CSR:**
  1. **Latency & the "Network Waterfall" penalty on slow connections:**
     - In SSR, the browser receives readable content on **Round Trip 1** (the initial HTML document).
     - In this CSR app, the browser must endure a sequential waterfall before anything appears:
       - *Round Trip 1:* Fetch `index.html` (empty shell).
       - *Round Trip 2:* Fetch JavaScript modules (`app.ts`, `state.ts`, etc.).
       - *Round Trip 3:* Fetch JSON data files (`case.json`, `evidence.json`, `timeline.json`).
       - *Round Trip 4:* Dynamically fetch `dashboard/index.html` and `dashboard/script.js`.
     - On a slow mobile connection (e.g., 3G with 300ms latency), 4 sequential round trips result in the user waiting **several seconds** before seeing even a headline, leading to high bounce rates and poor perceived performance.
  2. **Broken SEO and Link Previews (Open Graph / Scrapers):**
     - Web crawlers, link unfurlers (Slack, Discord, Twitter/X cards, LinkedIn previews), and simple scrapers do not run a full JavaScript execution engine with multi-stage asynchronous network requests.
     - When they scrape the URL, they only see `<main id="app"></main>`. They see no metadata, no case description, and no relevant keywords, severely harming search visibility and social sharing.
  3. **Client Device CPU & Battery Consumption:**
     - All data aggregation (filtering evidence, calculating progress percentages, building DOM nodes via string concatenation) is offloaded to the client's device. On low-end mobile devices, this causes UI jank, thread freezing, and battery drain.
