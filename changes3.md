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

---

## Demo 3 — The virtual DOM

### Tasks

#### 1. Explanation of the Virtual DOM and the Problem It Solves
The **Virtual DOM (VDOM)** is a lightweight, in-memory tree of plain JavaScript objects that mirrors the structure of the browser's real DOM. Each virtual node contains metadata describing an element (its tag, props, event listeners, and children).

**The Problem It Solves:**
In complex user interfaces, keeping the real DOM in sync with changing application data is hard:
- Directly writing fine-grained, imperative DOM mutations (`document.getElementById()`, `classList.toggle()`, `textContent = ...`) for every tiny state change is tedious, error-prone, and leads to messy, fragile code.
- To avoid that boilerplate, developers often resort to coarse-grained updates using `innerHTML = newHTML`. But `innerHTML` is a blunt instrument: it destroys the entire existing DOM subtree, forces the browser to re-parse HTML, reconstruct brand new DOM elements, and recalculate layout and styles—wiping out user text selection, input focus, and scroll position in the process.

The Virtual DOM solves this by providing a **declarative programming model**: developers write components as if the entire UI re-renders on every state update (`UI = f(state)`). Behind the scenes, the Virtual DOM engine compares the previous virtual tree with the new one (**diffing**) and computes the absolute minimal set of targeted mutations required to update the real DOM (**reconciliation / patching**).

---

#### 2. Concrete Example in the Original Vanilla `app.js`

In the original `app.js` (from before Exercise 1), a clear example of this problem occurs in the evidence list bookmarking functionality:

- **Location:** `app.js`, lines 434–450 (`handleBookmarkClick`) and lines 369–394 (`renderEvidenceList`):

```javascript
// app.js (Lines 434–450)
function handleBookmarkClick(evidenceId) {
  var ev = findEvidenceById(evidenceId);
  if (!ev) return;

  if (bookmarks.indexOf(evidenceId) === -1) {
    bookmarks.push(evidenceId);
    ev.bookmarked = true;
  } else {
    bookmarks = bookmarks.filter(function (id) {
      return id !== evidenceId;
    });
    ev.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (currentPage === "evidence") renderEvidenceList();
}
```

- **What happens inside `renderEvidenceList()` (Lines 369–394):**
```javascript
function renderEvidenceList() {
  var container = document.getElementById("evidenceList");
  if (!container) return;
  ...
  var results = getFilteredEvidence();

  var html = "";
  if (results.length === 0) {
    html = "<p>No evidence matches the current filters.</p>";
  }
  for (var i = 0; i < results.length; i++) {
    html += renderEvidenceCardHTML(results[i]);
  }
  container.innerHTML = html; // <-- Entire DOM subtree wiped out here!

  // Event delegation for card clicks / bookmark button.
  container.addEventListener("click", handleEvidenceListClick);
}
```

- **The Issue:**
  - When the user clicks the bookmark button on a single evidence card (e.g. card `E01`), only **one tiny thing actually changed**: that button's class needed to toggle between `""` and `"active"`, and its icon changed from `"☆"` to `"★"`.
  - However, `handleBookmarkClick()` called `renderEvidenceList()`.
  - `renderEvidenceList()` looped over every single card in the dataset, regenerated HTML strings for every card via `renderEvidenceCardHTML()`, and assigned `container.innerHTML = html`.
  - The browser had to tear down and destroy dozens of existing DOM card elements, parse a large HTML string, create dozens of brand new DOM elements, and perform a full layout reflow and repaint.
  - Furthermore, on line 393, a brand new `click` event listener was attached to `container` on every single bookmark click, introducing a classic event listener leak.

---

### Questions

#### 1. Using the example you found: how would a virtual-DOM-based approach avoid recreating the parts that didn't change?

A virtual-DOM-based approach handles the bookmark toggle through a 4-step reconciliation process:

1. **Initial Virtual Tree ($V_1$):**
   When the evidence list is rendered, the VDOM engine holds an in-memory tree of JavaScript objects representing the cards:
   ```javascript
   {
     type: 'div',
     props: { id: 'evidenceList' },
     children: [
       {
         type: 'div',
         key: 'E01',
         props: { className: 'evidence-card' },
         children: [
           { type: 'button', props: { className: 'bookmark-btn' }, children: ['☆'] },
           { type: 'h3', children: ['Initial System Diagnostics Log'] },
           ...
         ]
       },
       { type: 'div', key: 'E02', ... }
     ]
   }
   ```
2. **State Mutation & New Virtual Tree ($V_2$):**
   The user clicks bookmark on `E01`. State updates (`bookmarked: true`). React re-runs the component render function, producing a new virtual tree $V_2$ in memory.
3. **Diffing / Reconciliation:**
   The diffing algorithm compares $V_1$ and $V_2$ node by node (using `key` attributes to match list items):
   - For cards `E02`, `E03`, etc., the virtual nodes and their props are identical $\rightarrow$ **Zero DOM operations**.
   - For card `E01`, the title, summary, meta tags, and badges are identical $\rightarrow$ **Zero DOM operations**.
   - The diff algorithm isolates the exact difference: inside the button child of `E01`:
     - `props.className` changed from `'bookmark-btn'` to `'bookmark-btn active'`.
     - Text child changed from `'☆'` to `'★'`.
4. **Targeted Real DOM Patch:**
   Instead of touching `innerHTML`, the engine executes only two precise, surgical DOM operations:
   ```javascript
   buttonDOMElement.className = 'bookmark-btn active';
   textDOMNode.nodeValue = '★';
   ```
   All existing card DOM nodes, event listeners, input focus, and scroll position remain completely untouched.

---

#### 2. Is the virtual DOM a "faster" way to update the real DOM than directly calling `innerHTML`? Explain precisely what's actually being traded off.

- **Is it strictly "faster"?**
  **No.** The Virtual DOM is not inherently faster than raw direct DOM updates, and calling `innerHTML` in raw C++ browser code can be faster in pure millisecond execution time than constructing and diffing thousands of JavaScript objects.
  In fact, the absolute fastest possible update is handcrafted, fine-grained vanilla DOM manipulation:
  ```javascript
  btn.classList.toggle('active');
  btn.textContent = '★';
  ```
  This touches only what changed with zero VDOM overhead and zero object allocation.

- **What is actually being traded off:**
  1. **Developer Ergonomics (Declarative vs. Imperative) vs. CPU Diffing Work:**
     - In an imperative model, developers must manually track which specific DOM node to mutate whenever any state changes. In complex apps with dozens of interdependent UI elements, this becomes an unmaintainable nightmare.
     - The Virtual DOM allows developers to write **declarative code**—simply describing what the UI should look like for any given state (`UI = f(state)`).
     - The trade-off is that the client CPU spends a small amount of memory and execution time creating virtual nodes and diffing trees in JavaScript.
  2. **JavaScript Execution Time vs. Browser Layout/Paint Cost:**
     - JavaScript execution and object comparison in V8 is extremely fast (fractions of a millisecond).
     - Browser DOM destruction, HTML string parsing, element construction, style recalculation, layout reflow, and repaint are orders of magnitude slower and cause frame drops and UI stutter.
     - By spending a few microseconds in JavaScript to diff trees, the VDOM prevents the browser from paying the catastrophic rendering penalty of coarse `innerHTML` updates.

---

#### 3. Does using a virtual DOM library automatically make your app fast? What could still make a React app slow despite it?

- **Does it make your app automatically fast?**
  **No.** The Virtual DOM is an abstraction that guarantees a solid performance baseline by avoiding naive full-DOM destructions, but poor application architecture can easily degrade performance.

- **What could still make a React app slow despite the Virtual DOM:**
  1. **Cascading Unnecessary Re-renders:**
     By default in React, when a parent component's state changes, **every child and descendant in that component's tree re-renders recursively**. Even if the diffing algorithm ultimately finds zero DOM changes to apply, the CPU still had to execute dozens or hundreds of component functions and build huge virtual trees in memory on every interaction.
  2. **Heavy Computations in the Render Body:**
     Running synchronous heavy operations (e.g. sorting a 10,000-item array, complex regex filtering, or deep object cloning) directly inside the component body blocks the browser main thread, causing noticeable input lag and dropped frames (unless wrapped in `useMemo` or moved to Web Workers).
  3. **Missing, Inefficient, or Unstable `key` Props in Lists:**
     Using array indexes (`key={index}`) or random numbers (`key={Math.random()}`) when rendering lists breaks React's reconciliation. If an item is inserted, deleted, or sorted, React fails to match elements across renders and destroys/re-creates every DOM node in the list anyway, completely negating the VDOM's benefits.
  4. **Un-virtualized Massive DOM Subtrees:**
     If a component renders 5,000 table rows or cards at once, creating 5,000 virtual nodes and mounting 50,000 real DOM nodes will overwhelm the browser's layout engine and consume massive RAM. The VDOM cannot fix having too many real DOM nodes on the page; windowing/virtual scrolling (e.g. `react-window`) is required.
  5. **Broken Reference Equality (Inline Functions and Objects):**
     Passing inline object literals (`style={{ color: 'red' }}`) or inline arrow functions (`onClick={() => ...}`) creates brand new object references on every render. If passed to memoized children (`React.memo`), the child will fail shallow prop equality and re-render unnecessarily every time.

---

## Demo 4 — SPA vs. MPA: state & routing

### Tasks

#### 1. How Navigation Currently Works in this Application

```mermaid
flowchart TD
    A["User Interaction<br>(Click nav button, inline link, or Back/Forward)"] --> B["navigateTo('view') sets window.location.hash = view"]
    B --> C["Browser fires native 'hashchange' event"]
    C --> D["handleHashChange() in src/app.ts runs"]
    D --> E["Extract view name from hash (default 'dashboard')"]
    E --> F["Toggle .active class on Header Nav Buttons"]
    F --> G["targetRoute.loadHtml()<br>Dynamic import raw HTML snippet"]
    G --> H["appContainer.innerHTML = htmlModule.default<br>Injects view snippet into DOM"]
    H --> I["targetRoute.loadModule()<br>Dynamic import view JS/TS module"]
    I --> J["module.init()<br>Renders data from in-memory state into DOM"]
```

- **What triggers a view change:**
  1. Clicking a persistent header navigation button (e.g. `<button onclick="navigateTo('evidence')">`).
  2. Clicking inline navigation buttons in views (e.g. "View all evidence" on the Dashboard or "Open" in the Workspace).
  3. Manually typing or editing the hash in the browser address bar (e.g. `#timeline`).
  4. Pressing the browser's **Back** or **Forward** navigation buttons.

- **What code runs:**
  1. `navigateTo(viewName)` sets `window.location.hash = viewName`.
  2. The browser dispatches the native `hashchange` event on `window`.
  3. `handleHashChange()` in `src/app.ts` is triggered:
     - Strips `#` and normalizes the view string: `let view = window.location.hash.replace('#', '').trim();`.
     - Validates against the `routes` dictionary (falling back to `'dashboard'` if invalid).
     - Updates the in-memory state: `state.currentPage = view`.
     - Highlights the active navigation button by toggling the `.active` class on `.nav-btn` elements.
     - Asynchronously fetches the view's HTML snippet using Vite's dynamic raw import: `targetRoute.loadHtml()`.
     - Replaces `#app`'s contents: `appContainer.innerHTML = htmlModule.default`.
     - Adds the `.active` class to the injected `<section class="view">`.
     - Dynamically imports the view's module: `targetRoute.loadModule()`.
     - Calls `module.init()`, which reads the cached global `state` and binds event listeners/populates DOM elements.

- **What does NOT happen (that would happen in a classic multi-page site):**
  - **No HTTP request to the web server:** The browser does not issue an HTTP GET request for a new document. The server is completely unaware that navigation occurred.
  - **No document unloading or white flash:** The browser does not destroy the window, DOM tree, or global JavaScript scope.
  - **No header/footer re-parsing:** The persistent header (`.app-header`), footer (`.app-footer`), and base styles remain untouched in the DOM.
  - **No re-fetching of JSON data:** The datasets loaded at startup (`allEvidence`, `allPeople`, `allLocations`, `allTimeline`, `caseData`) stay resident in memory in `src/state.ts`. The browser does not re-download them across the network.
  - **No re-downloading of CSS or JS bundles:** The browser does not re-parse stylesheets or re-evaluate core application code.

---

#### 2. State Preservation Matrix (Full Page Reload vs. Preserved)

| State Item | Storage Location | Preserved on Full Page Reload? | Notes / Explanation |
|---|---|:---:|---|
| **Bookmarks** (`state.bookmarks`) | `localStorage` (`remotion_bookmarks`) | **YES** | Loaded during `initApp()` via `loadBookmarksFromStorage()`. |
| **Evidence Notes** (`state.notesStore`) | `localStorage` (`remotion_notes`) | **YES** | Dictionary mapping `evidenceId -> noteText` loaded via `loadNotesFromStorage()`. |
| **Hypothesis Saved Draft** | `localStorage` (`remotion_hypothesis`) | **YES** | Contains saved suspect ID, nature, selected evidence IDs, confidence score, and explanation. Loaded on Workspace visit via `loadHypothesisFromStorage()`. |
| **Current Route View** | URL Fragment (`window.location.hash`) | **YES** | The URL hash (e.g. `localhost:5173/#evidence`) persists in the browser address bar; on reload, `handleHashChange()` reads it and routes directly to that view. |
| **Evidence Filter Inputs** | In-Memory DOM / Local scope | **NO** | Active text search query, dropdown filters (Type, Person, Location, Status, Relevance), and Sort order reset to default values (`""`, `"newest"`). |
| **Filtered Evidence Array** (`state.filteredEvidence`) | In-Memory (`src/state.ts`) | **NO** | Discarded from RAM; recomputed on next evidence view render. |
| **Selected Evidence / Open Modals** (`state.selectedEvidence`) | In-Memory (`src/state.ts`) | **NO** | Any open modal (Evidence detail, Timeline event modal, Person/Location modal) closes immediately. |
| **People vs. Locations Active Tab** (`state.currentPeopleTab`) | In-Memory (`src/state.ts`) | **NO** | Resets back to default `'people'`. |
| **Unsaved Workspace Draft Inputs** | In-Memory DOM form inputs | **NO** | Text typed into the hypothesis fields that was not saved via the "Save Hypothesis" button is permanently lost. |
| **Runtime Loading Flags & Counters** (`loadingStepsRemaining`, `evidenceViewLoading`, `modalCloseListenerCount`) | In-Memory (`src/state.ts`) | **NO** | Reset to initial startup values; initial loading sequence re-runs. |
| **Loaded Case Data & Datasets** (`caseData`, `allEvidence`, `allPeople`, `allLocations`, `allTimeline`) | In-Memory Heap (`src/state.ts`) | **NO** | RAM is wiped; all JSON files must be re-fetched over the network during bootstrap. |
| **UI Scroll Positions** | Browser Viewport / Containers | **NO** | Resets to the top of the page. |

---

### Questions

#### 1. In a traditional multi-page app, where does "the current page's data" live between requests? Where does it live in this SPA instead, and what are the consequences of that difference (for good and for bad)?

- **Where data lives between requests:**
  - **Traditional Multi-Page App (MPA):**
    The client browser holds **no continuous state** between page navigations. Between requests, the data lives on the **server** (in databases, backend sessions, or server memory caches). The client only holds lightweight identifiers (session cookies or URL query parameters). On each navigation, the browser destroys its entire memory space, and the server reconstructs the view from scratch.
  - **Single-Page App (this SPA):**
    Data lives directly in **client browser RAM** (specifically inside the JavaScript engine's heap: the global `state` object exported by `src/state.ts`), supplemented by browser `localStorage` for explicit persistence.

- **Consequences of this difference:**
  - **The Good (Benefits):**
    1. **Instantaneous Navigation:** Switching from Evidence to Dashboard requires zero network round trips to fetch data. The numbers and cards are calculated immediately from in-memory objects.
    2. **Offline & Network Resilience:** Once the initial data bootstrap completes, the user can filter evidence, view timelines, and inspect people even if their internet connection drops entirely.
    3. **Cross-View State Sharing:** Views can effortlessly coordinate. When a user bookmarks an evidence item in the Evidence view, the Workspace and Dashboard reflect this immediately without coordinating through a server.
    4. **Reduced Server Infrastructure Load:** The server does not maintain user sessions or execute heavy database queries for every view change.
  - **The Bad (Drawbacks & Risks):**
    1. **Stale Data / Data Drift:** If data changes on the server (e.g. another investigator adds evidence), the SPA continues displaying outdated data from RAM indefinitely unless active polling, WebSockets, or revalidation is built.
    2. **Memory Leaks & Bloat:** Long-lived client-side applications accumulate memory if event listeners or DOM references are not cleaned up (e.g. the repeated click listener bug on `#evidenceList`).
    3. **State Loss on Accidental Reload:** Any in-memory state (filter settings, scroll position, modal state) is wiped clean on reload unless specifically synchronized to the URL or storage.

---

#### 2. This app currently implements routing by hand (`handleHashChange()`, a `switch`-like chain of `if`s, and manually toggling CSS classes). What is a router library actually responsible for that this hand-rolled version does *not* handle?

A professional router library (such as React Router, TanStack Router, or Vue Router) provides several critical production capabilities that this hand-rolled hash implementation lacks:

1. **Dynamic Route Parameters (`:id`):**
   A router matches URL patterns with variables (e.g. `#/evidence/:evidenceId` or `#/people/:personId`). Currently, opening an evidence detail card only updates an in-memory variable (`selectedEvidence`) and opens a modal—meaning you cannot bookmark or share a direct URL link to a specific evidence item!
2. **Query Parameter Management & URL Synchronization:**
   A router parses, serializes, and synchronizes search/filter parameters with the URL (e.g. `#/evidence?search=drone&status=reviewed&sort=newest`). In the current app, filters live exclusively in transient DOM inputs and are lost on navigation.
3. **Nested & Layout Routing:**
   A router allows child routes to render inside parent layouts without re-rendering or wiping out the parent container. In this app, navigating destroys `#app.innerHTML` entirely.
4. **Navigation Guards & Lifecycle Hooks:**
   Routers support hooks like `beforeEach` / `canDeactivate` to intercept navigation (e.g. warning the user: *"You have unsaved changes in your hypothesis draft. Are you sure you want to leave?"*). The current app has no way to block navigation.
5. **Modern HTML5 History API (`pushState`/`replaceState`):**
   Real routers support clean URLs (`/evidence` instead of `/#evidence`) without page reloads, while falling back gracefully.
6. **Code-Splitting, Lazy Loading & Loading Skeletons:**
   Modern routers integrate with build tools to automatically bundle, pre-fetch, and lazy-load route chunks, rendering suspense fallbacks while routes load.
7. **Scroll Restoration:**
   Routers automatically remember and restore the exact scroll position when users navigate back and forward through their history.
8. **Accessibility (a11y) & Focus Management:**
   When a client-side route changes, routers update document titles and announce route changes to screen readers via ARIA live regions, focusing the new main heading for keyboard users.

---

#### 3. If the user hits the browser's back button right now, what happens in this app, and why?

- **What happens:**
  - The browser's active URL updates to the previous hash in the session history (for example, navigating from `http://localhost:5173/#timeline` back to `http://localhost:5173/#evidence`).
  - The browser fires the native `hashchange` event on the `window` object.
  - The `handleHashChange()` listener in `src/app.ts` executes automatically.
  - It extracts the previous view name (`'evidence'`), updates `state.currentPage = 'evidence'`, highlights the "Evidence" button in the header nav, dynamically imports `pages/evidence/index.html` and `pages/evidence/script.ts`, and renders the evidence view.
  - To the user, it successfully "navigates back" to the previous page.

- **Why it works:**
  - Every time `window.location.hash = viewName` is called (or an `<a href="#evidence">` is clicked), the browser treats the hash change as a new entry in its internal navigation history stack.
  - Clicking the **Back** button tells the browser to pop the current history entry and restore the previous URL. Because the URL change is limited to the hash fragment, the browser does not make a network request; instead, it dispatches the native `hashchange` event, which our listener is registered to handle.

- **The Big Catch / Current Limitations:**
  - The back button **only tracks top-level page views**, not user interactions within a view:
    1. If the user opens an evidence detail modal and clicks "Back" expecting the modal to close, the app instead navigates away to whatever previous page they were on!
    2. If the user switched tabs in People & Locations (from People to Locations), clicking "Back" does not switch back to the People tab; it navigates to the previous page because sub-tabs do not update the URL hash.
    3. Any search queries or filter selections applied before navigating away are completely wiped out upon returning via the back button.

---

## Demo 5 — React introduction

### Tasks

#### 1. Tiny Component Written from Scratch (`CaseSummary`)

We authored a standalone component (`CaseSummary`) in a throwaway sandbox (`src/sandbox.html`) rendering static data via JSX:

```jsx
function CaseSummary() {
  const str = 'Active Lead';

  return (
    <div className="sandbox-container">
      <div className="sandbox-tag">React Sandbox &bull; Demo 5</div>
      <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#fff' }}>
        Project ReMotion
      </h1>
      <p style={{ margin: '0 0 1.25rem 0', color: '#94a3b8', fontSize: '0.95rem' }}>
        Investigation in progress: AI-assisted rehabilitation robot malfunction.
      </p>
      <span className="badge badge-flagged" style={{ fontSize: '0.85rem' }}>
        {str}
      </span>
    </div>
  );
}

// Mounted in the sandbox DOM:
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CaseSummary />);
```

- **Live Sandbox File:** Created at `src/sandbox.html` using standalone React 18 and Babel, running in the browser and demonstrating our JSX component live.

---

#### 2. What "Component" Means in React vs. a Function Returning an HTML String

- **Vanilla Function returning an HTML String (e.g. `renderEvidenceCardHTML` in `app.js`):**
  - **Raw Text Output:** It simply concatenates characters into a long text string (`"<div>" + ev.title + "</div>"`). The browser engine has no structural understanding of this string until it is assigned to `container.innerHTML`.
  - **Destructive Updates:** When injected via `innerHTML`, the browser must wipe out the entire existing DOM container, parse the raw HTML string, instantiate new DOM elements from scratch, and recalculate the layout (reflow & repaint).
  - **Security Risk (XSS):** If user-supplied data in `ev.title` contains `<script>` or malicious tags, it will be injected directly into the DOM unless manually escaped.
  - **Decoupled Architecture:** Markup is created in a string-builder function, event listeners are attached in a separate `init()` function via event delegation, and state lives in disconnected global variables.

- **React Component (`CaseSummary`):**
  - **Object / Virtual DOM Output:** A React component is a JavaScript function that returns **JSX**, which compiles directly into Virtual DOM JavaScript objects (`React.createElement(...)`).
  - **Surgical, Non-Destructive DOM Updates:** Instead of blowing away containers, React performs in-memory diffing between renders and updates only the exact properties or text nodes that changed, preserving element focus, selection, and scroll positions.
  - **Automatic XSS Protection:** Values placed inside `{curlyBraces}` are automatically sanitized and treated strictly as text data, neutralizing script injection attacks.
  - **Encapsulated Building Block:** A component unites structure (JSX), behavior (events), and lifecycle into a reusable, self-contained unit.

---

### Questions

#### 1. What is JSX, actually? What does it compile to?

- **What JSX is:**
  - JSX (JavaScript XML) is a **syntax extension (syntactic sugar)** for JavaScript that allows developers to write familiar, HTML-like markup directly within JavaScript files.
  - Browsers **cannot natively execute JSX**. If loaded directly into a browser JS engine, it causes a `SyntaxError`.
- **What it compiles to:**
  - Before reaching the browser, build tools (such as Babel, esbuild, or SWC) compile JSX down into standard JavaScript function calls:
    ```javascript
    // Classic runtime:
    React.createElement('h1', null, 'Project ReMotion');

    // Modern JSX runtime:
    import { jsx as _jsx } from 'react/jsx-runtime';
    _jsx('h1', { children: 'Project ReMotion' });
    ```
  - These function calls return lightweight **plain JavaScript objects** representing the Virtual DOM node:
    ```javascript
    {
      type: 'h1',
      props: { children: 'Project ReMotion' },
      key: null,
      ref: null
    }
    ```

---

#### 2. Compare your tiny component to the old `renderEvidenceCardHTML(ev)` function. What is fundamentally different about how each one's output becomes real DOM?

| Dimension | `renderEvidenceCardHTML(ev)` (Old Vanilla) | `CaseSummary()` (React Component) |
|---|---|---|
| **Return Value** | A primitive **string** of HTML characters (`"<div class=...>...</div>"`). | A **JavaScript Object** (Virtual DOM element tree). |
| **How it Reaches the DOM** | Assigned to `container.innerHTML = htmlString`. | Handled by React's reconciler (`ReactDOM.createRoot().render(...)`). |
| **Browser Pipeline** | Browser halts JS, parses raw HTML text with C++ parser, destroys previous DOM nodes, creates brand-new DOM elements, and forces a full layout reflow/repaint. | React compares the new virtual object tree with the previous virtual tree (**diffing**). It calls fine-grained native DOM methods (`document.createElement()`, `element.setAttribute()`, `node.textContent = ...`) **only on modified nodes**. |
| **Element Identity** | Existing DOM elements and event listeners are destroyed and recreated from scratch. | Real DOM elements are preserved across renders; focus and scroll positions are retained. |
| **Security Handling** | Unescaped string concatenation allows malicious `<script>` injection (XSS). | Interpolated expressions `{str}` are automatically escaped as text, preventing XSS. |

---

#### 3. What does it mean that "components are just functions" in React? What would break if a component's function body had a side effect (e.g. mutated a global variable) every time it rendered?

- **What "components are just functions" means:**
  - In React, a component is designed to behave like a **pure function**:
    $$\text{UI} = f(\text{props, state})$$
  - Given the same inputs (props and state), it should always produce and return the exact same JSX/Virtual DOM representation.
  - The render phase should be mathematically "pure": it must calculate the UI description without reaching outside its own scope to mutate external state, modify the global environment, or trigger side effects.

- **What would break if a component's function body had a side effect (e.g. mutating a global variable):**
  1. **Unpredictable Render Frequency & State Corruption:**
     - Developers do not control when or how often React invokes a component function. React re-renders components whenever a parent updates, context changes, or during performance optimizations.
     - In development mode, **React Strict Mode deliberately executes every component function TWICE** on each render to identify accidental side effects.
     - If your function body mutates an external variable (e.g. `globalCount++` or modifies a global list), the count will jump unpredictably (e.g. increments by 2, 4, or 10 on seemingly unrelated interactions), corrupting the application state.
  2. **Race Conditions & Non-Deterministic UI:**
     - If multiple components read and mutate shared global variables during rendering, their execution order determines the outcome. Because React can pause, resume, or abort render work (concurrent rendering), the UI becomes erratic, buggy, and impossible to debug.
  3. **Where Side Effects Belong in React:**
     - Side effects (such as fetching data, writing to `localStorage`, setting timers, or manually mutating the real DOM) must **never** run naked in the render function body.
     - They must be isolated inside **event handlers** (e.g. `onClick`, `onSubmit`) or managed lifecycle hooks (**`useEffect`**), which React guarantees will run only after the DOM has been safely updated.

---

## Demo 6 — React + TypeScript entry point in the Vite project

### Tasks

#### 1. Adding React and TypeScript Support to the Vite Project
To enable native React and TypeScript JSX/TSX compilation, we performed the following:

1. **Installed Runtime Dependencies:**
   ```bash
   pnpm add react react-dom
   ```
   - Installed `react 19.3.0` and `react-dom 19.3.0`.
2. **Installed Development Tooling & Types:**
   ```bash
   pnpm add -D @types/react @types/react-dom @vitejs/plugin-react
   ```
   - Added TypeScript declarations for React and DOM types.
   - Installed `@vitejs/plugin-react 6.1.1` (the official Vite plugin providing Fast Refresh and JSX transformation).
3. **Configured `vite.config.js`:**
   - Imported `react from '@vitejs/plugin-react'` and registered it in the `plugins` array:
   ```javascript
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';

   export default defineConfig({
     plugins: [react()],
     base: './',
     root: 'src',
     publicDir: '../public',
     build: {
       outDir: '../dist',
       emptyOutDir: true,
     },
   });
   ```
4. **Configured `tsconfig.json`:**
   - Added `"jsx": "react-jsx"` to `compilerOptions`. This instructs TypeScript to recognize JSX/TSX syntax and emit modern React 17+ JSX runtime imports automatically (`react/jsx-runtime`).

---

#### 2. Creating a Minimal Entry Point (`App` Component Mounted into `#react-root`)

1. **Created Root Component (`src/ReactApp.tsx`):**
   - Implemented a clean, interactive React root component with interactive state (`useState` count button):
   ```tsx
   import React, { useState } from 'react';

   export const App: React.FC = () => {
     const [count, setCount] = useState<number>(0);

     return (
       <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
         <div className="card" style={{ background: '#ffffff', borderRadius: '8px', padding: '2rem', boxShadow: 'var(--shadow)' }}>
           <h2>⚛️ React + TypeScript Entry Point</h2>
           <p>Compiled via Vite and TypeScript and mounted into #react-root.</p>
           <button type="button" className="btn btn-primary" onClick={() => setCount(prev => prev + 1)}>
             Interactive React State: Clicked {count} times
           </button>
           <button type="button" className="btn btn-secondary" onClick={() => { window.location.hash = 'dashboard'; }}>
             &larr; Return to Vanilla Dashboard
           </button>
         </div>
       </div>
     );
   };
   export default App;
   ```
2. **Created Application Mounting Entry Point (`src/main.tsx`):**
   - Connects the React component tree to the real DOM container:
   ```tsx
   import React from 'react';
   import ReactDOM from 'react-dom/client';
   import { App } from './ReactApp';

   const container = document.getElementById('react-root');
   if (container) {
     const root = ReactDOM.createRoot(container);
     root.render(
       <React.StrictMode>
         <App />
       </React.StrictMode>
     );
   }
   ```
3. **Updated `src/index.html`:**
   - Added the dedicated container `<div id="react-root" class="app-main hidden"></div>` alongside the vanilla `<main id="app">`.
   - Added `<script type="module" src="main.tsx"></script>` so React initializes on page load.
   - Added a dedicated nav button `<button class="nav-btn" data-view="react" onclick="navigateTo('react')">⚛️ React Preview</button>` in the persistent header.

---

#### 3. Coexistence Strategy During Migration

- **Decision: Dual-Mount Route-Toggled Container Coexistence**
  - Rather than wiping out the vanilla application in a single disruptive change, we run both applications within the same Vite project simultaneously.
  - In `src/app.ts`, `handleHashChange()` manages visibility:
    - On root URL load (or when `#react` is visited), `app.ts` adds `.hidden` to the vanilla `#app` container and removes `.hidden` from the `#react-root` container, displaying **only** the React component card.
    - When the user clicks "Return to Vanilla Dashboard" (or navigates to `#dashboard`, `#evidence`, `#people`, `#timeline`, `#workspace`), `app.ts` hides `#react-root` and unhides `#app`, seamlessly restoring the vanilla views without both appearing simultaneously.
  - **Justification:**
    - Allows safe, zero-downtime, incremental migration.
    - The existing, fully-featured vanilla app remains 100% operational for regression testing, side-by-side comparison, and class evaluation while subsequent demos migrate individual views.

---

### Questions

#### 1. What did you actually have to install and configure to get JSX compiling through Vite? What is each piece responsible for?

- **Packages Installed:**
  1. `react`: Core React library. Responsible for component definition APIs, the Virtual DOM data structures, and React Hooks (`useState`, `useEffect`).
  2. `react-dom`: The browser-specific DOM renderer. Responsible for creating the root (`ReactDOM.createRoot`), mounting components to native browser DOM nodes, and reconciling the Virtual DOM with the real DOM.
  3. `@types/react` & `@types/react-dom`: TypeScript type declarations. Responsible for type-checking JSX tags, props, synthetic events, and React APIs during `tsc --noEmit`.
  4. `@vitejs/plugin-react`: The official Vite plugin. Responsible for configuring esbuild and Babel to compile JSX/TSX syntax down to JavaScript, enabling Hot Module Replacement (Fast Refresh) so components update instantly without full reloads, and injecting the modern JSX runtime.
- **Configurations Made:**
  1. `vite.config.js`: Registered `react()` in `plugins: [react()]` to activate the Vite React transform pipeline.
  2. `tsconfig.json`: Added `"jsx": "react-jsx"` to `compilerOptions` so TypeScript understands JSX without requiring an explicit `import React from 'react'` at the top of every file.

---

#### 2. How does your `<App />` component get from source code onto the actual page? Trace the path from your `.tsx` file to the DOM.

1. **Authoring (`src/ReactApp.tsx`):**
   - The developer authors `<App />` as a TypeScript function returning JSX markup.
2. **Compilation & Bundling (Vite + esbuild/Babel):**
   - When Vite serves or builds the project, `@vitejs/plugin-react` processes `ReactApp.tsx`.
   - It strips TypeScript annotations and converts JSX syntax into standard JavaScript function calls:
     `_jsx('div', { children: [ _jsx('h2', { children: 'React Entry Point' }), ... ] })`.
3. **Module Loading (`src/main.tsx`):**
   - The browser parses `index.html` and requests the module `<script type="module" src="main.tsx"></script>`.
   - `main.tsx` dynamically executes, importing `App` from `ReactApp.tsx`.
4. **Root Attachment (`ReactDOM.createRoot`):**
   - `main.tsx` executes `document.getElementById('react-root')` to obtain the reference to the empty placeholder container in `index.html`.
   - It initializes a React root: `const root = ReactDOM.createRoot(container)`.
5. **Reconciliation & Real DOM Generation:**
   - React invokes the `<App />` function component, receiving the Virtual DOM tree.
   - React's reconciler converts these virtual objects into real DOM elements using native browser APIs (`document.createElement('div')`, `document.createElement('button')`, `addEventListener('click', ...)`).
   - It appends the constructed element hierarchy into `#react-root`.
6. **Route Visibility (`handleHashChange` in `src/app.ts`):**
   - When the user navigates to `#react`, `handleHashChange()` unhides `#react-root` (`classList.remove('hidden')`) and hides `#app`. The interactive React component becomes visible to the user.

---

#### 3. What decision did you make about how the vanilla and React versions coexist during migration, and why? What would go wrong with an opposite choice?

- **The Decision Made:**
  - We implemented a **Dual-Mount / Route-Toggled Container Coexistence** architecture.
  - The vanilla app mounts into `<main id="app">` and the React app mounts into `<div id="react-root">`.
  - The hash router coordinates which container is visible based on the URL hash (`#react` vs. `#dashboard`).
- **Why this was chosen:**
  1. **Risk Mitigation:** It allows progressive, incremental migration of views without breaking existing functionality.
  2. **Live Side-by-Side Comparison:** Evaluators, users, and developers can seamlessly switch between the working vanilla implementation and the React prototype to verify visual and behavioral fidelity.
  3. **Continuous Deployment Safety:** The app remains in a permanently buildable, deployable state across all CI/CD pipelines.
- **What would go wrong with an opposite choice (e.g. an immediate "Big Bang" full swap-over):**
  1. **Complete Application Breakdown:** If we immediately deleted `app.ts` and replaced `#app` with React in Demo 6, 80% of the portal (Evidence filtering, People directory, Interactive Timeline, and Hypothesis Workspace) would cease to exist because they aren't migrated to React until later exercises!
  2. **High Regression Risk:** Migrating everything at once prevents isolated testing and makes debugging root causes nearly impossible.
  3. **All-or-Nothing Delivery:** If a bug occurs during migration, the entire project is blocked from shipping or being demonstrated.

---

## Demo 7 — Component hierarchy for the whole app

### Tasks

#### 1. Proposed Component Hierarchy Diagram for the Entire Application

The following diagram maps out the complete target React component architecture for all five views and shared layout primitives across the portal:

```mermaid
graph TD
    App["App (Root Shell)"]
    App --> AppHeader["AppHeader"]
    App --> LoadingOverlay["LoadingOverlay"]
    App --> PageContainer["Main Content / Router Switch"]
    App --> AppFooter["AppFooter"]

    AppHeader --> Brand["Brand (Logo & Title)"]
    AppHeader --> Nav["MainNavigation"]
    Nav --> NavButton["NavButton (x6 views)"]

    PageContainer --> DashboardPage["DashboardPage"]
    PageContainer --> EvidencePage["EvidencePage"]
    PageContainer --> PeopleLocationsPage["PeopleLocationsPage"]
    PageContainer --> TimelinePage["TimelinePage"]
    PageContainer --> WorkspacePage["WorkspacePage"]

    %% Dashboard Subtree
    DashboardPage --> CaseSummaryCard["CaseSummaryCard"]
    CaseSummaryCard --> Badge1["Badge (Status)"]
    DashboardPage --> StatGrid["StatGrid"]
    StatGrid --> StatCard["StatCard (x3: Evidence, Leads, Events)"]
    DashboardPage --> ProgressBar["ProgressBar (Review Progress)"]
    DashboardPage --> RecentEvidence["RecentEvidenceList"]
    RecentEvidence --> EvidenceCard1["EvidenceCard (Compact)"]
    DashboardPage --> RecentTimeline["RecentTimelineList"]
    RecentTimeline --> TimelineItem1["TimelineItem (Summary)"]

    %% Evidence Subtree
    EvidencePage --> EvidenceFilterBar["EvidenceFilterBar"]
    EvidenceFilterBar --> SearchInput["SearchInput"]
    EvidenceFilterBar --> SelectDropdown["SelectDropdown (Type, Person, Location, Status, Sort)"]
    EvidencePage --> EvidenceList["EvidenceList"]
    EvidenceList --> EvidenceCard2["EvidenceCard (Full)"]
    EvidenceCard2 --> BookmarkButton["BookmarkButton"]
    EvidenceCard2 --> Badge2["Badge (Critical, Status, Relevance)"]
    EvidenceCard2 --> TagChip["TagChip"]
    EvidencePage --> EvidenceDetailModal["EvidenceDetailModal"]
    EvidenceDetailModal --> ModalWrapper1["Modal (Reusable Backdrop & Shell)"]
    EvidenceDetailModal --> NotesEditor["NotesEditor (Textarea & Save)"]

    %% People & Locations Subtree
    PeopleLocationsPage --> TabSwitcher["TabSwitcher (People / Locations)"]
    PeopleLocationsPage --> PeopleGrid["PeopleGrid"]
    PeopleGrid --> PersonCard["PersonCard"]
    PersonCard --> Badge3["Badge (Role/Status)"]
    PeopleLocationsPage --> LocationsGrid["LocationsGrid"]
    LocationsGrid --> LocationCard["LocationCard"]
    PeopleLocationsPage --> PersonModal["PersonDetailModal"]
    PersonModal --> ModalWrapper2["Modal"]

    %% Timeline Subtree
    TimelinePage --> TimelineFilterBar["TimelineFilterBar"]
    TimelinePage --> TimelineStream["TimelineStream"]
    TimelineStream --> TimelineItem2["TimelineItem"]
    TimelineItem2 --> Badge4["Badge (Category)"]
    TimelinePage --> TimelineModal["TimelineEventModal"]
    TimelineModal --> ModalWrapper3["Modal"]

    %% Workspace Subtree
    WorkspacePage --> BookmarksList["BookmarksSidebar"]
    BookmarksList --> MiniItem["MiniEvidenceItem"]
    MiniItem --> BookmarkButton2["BookmarkButton"]
    WorkspacePage --> NotesSummary["NotesSummaryList"]
    WorkspacePage --> HypothesisBuilder["HypothesisBuilder"]
    HypothesisBuilder --> FormSelect["FormSelect (Suspect, Nature)"]
    HypothesisBuilder --> ConfidenceSlider["ConfidenceSlider (Range Input)"]
    HypothesisBuilder --> FormTextarea["FormTextarea (Explanation, Alternative)"]
    HypothesisBuilder --> SaveAlert["SavedNotificationAlert"]
```

---

#### 2. Component Data & Props Specifications (5 Representative Components)

| Component | Props & Types | Data Source |
|---|---|---|
| **1. `EvidenceCard`** | <ul><li>`evidence: EvidenceItem` (id, title, summary, timestamp, type, status, relevance, tags)</li><li>`isBookmarked: boolean`</li><li>`onToggleBookmark: (id: string) => void`</li><li>`onSelect: (id: string) => void`</li><li>`compact?: boolean`</li></ul> | `evidence` comes from the active filtered list; `isBookmarked` is derived from global bookmarks state (`state.bookmarks.includes(id)`); handlers trigger state updates. |
| **2. `StatCard`** | <ul><li>`label: string`</li><li>`value: number \| string`</li><li>`description?: string`</li><li>`icon?: string`</li><li>`variant?: 'primary' \| 'warn' \| 'ok'`</li></ul> | Calculated/derived values computed in parent (`DashboardPage`): derived from `allEvidence.length`, count of active leads, and timeline events count. |
| **3. `Badge`** | <ul><li>`label: string`</li><li>`variant: 'critical' \| 'flagged' \| 'reviewed' \| 'unreviewed' \| 'relevant' \| 'neutral'`</li><li>`size?: 'sm' \| 'md'`</li></ul> | Passed directly from parent items based on entity attributes (e.g. `evidence.status`, `caseData.status`, or `person.role`). |
| **4. `Modal`** | <ul><li>`isOpen: boolean`</li><li>`title: string`</li><li>`onClose: () => void`</li><li>`children: React.ReactNode`</li><li>`maxWidth?: string`</li></ul> | `isOpen` is controlled by parent page state (e.g. `selectedEvidenceId !== null`); `onClose` resets the selection state to `null`. |
| **5. `HypothesisBuilder`** | <ul><li>`people: Person[]`</li><li>`evidence: EvidenceItem[]`</li><li>`initialDraft: HypothesisDraft`</li><li>`onSave: (draft: HypothesisDraft) => void`</li></ul> | `people` and `evidence` passed down from root/loaded datasets; `initialDraft` loaded from `localStorage` (`STORAGE_KEY_HYPOTHESIS`); `onSave` persists to `localStorage`. |

---

### Questions

#### 1. What criteria did you use to decide something should be its own component versus staying inline inside a bigger one?

We used four primary architectural criteria:

1. **Reusability & DRY (Don't Repeat Yourself):**
   - If a piece of UI markup and styling is used in two or more distinct locations (such as `Badge`, `Modal`, `EvidenceCard`, and `BookmarkButton`), extracting it prevents duplicate markup and ensures consistent design system tokens across views.
2. **Encapsulated State & Complex Logic:**
   - If an element manages its own internal state, user events, or side effects (such as `ConfidenceSlider` managing a range input, `NotesEditor` handling draft inputs, or `EvidenceFilterBar` handling 6 input dropdowns), keeping it inline clutters the parent page. Extracting it keeps the parent clean and gives the sub-feature a single, isolated responsibility.
3. **Render Performance & Re-render Isolation:**
   - In React, when state changes, the component owning that state and all its children re-render. By isolating localized interactive controls (e.g., clicking a bookmark star or typing in a search bar) into their own child components, we can prevent expensive re-renders of the entire page layout.
4. **Declarative Readability & Maintainability:**
   - A parent page composed of clear, semantic component tags (`<CaseSummaryCard />`, `<StatGrid />`, `<ProgressBar />`, `<RecentEvidenceList />`) can be understood in seconds, whereas a single 600-line monolithic file of nested `<div>`s and inline string interpolations is difficult to maintain and test.

---

#### 2. Pick one component in your diagram that appears in more than one place in the app. What made you extract it instead of duplicating its markup, and how does that compare to how the original vanilla app handled (or didn't handle) that same duplication?

- **Chosen Component: `<Badge />`**
  - **Where it appears across the app:**
    1. Case Summary status on the Dashboard (`FLAGGED`)
    2. Evidence card status badges (`reviewed`, `flagged`, `unreviewed`)
    3. Evidence card relevance badges (`relevant`, `unreviewed`)
    4. Critical incident tags (`badge-critical`)
    5. People status & roles in People & Locations
    6. Timeline event category tags
    7. Evidence detail modal header
- **Why we extracted it:**
  - A badge is a core visual indicator across every single view. Extracting it into `<Badge variant={status} label={label} />` encapsulates the CSS class mappings, color tokens, and accessibility attributes in **one single component**. If a badge style changes or a new status is added, we edit one line in one file rather than hunting across the codebase.
- **How the original vanilla app handled (or failed to handle) this duplication:**
  - In `app.js`, badge creation was fragmented and inconsistent:
    - Evidence list used custom string-helper functions: `getStatusBadgeClass(status)` and `getRelevanceBadgeClass(relevance)`.
    - Dashboard hardcoded strings directly: `'<span class="badge badge-flagged">' + caseData.status + '</span>'`.
    - Timeline modal hardcoded different span tags with inline class concatenation.
    - If a developer wanted to change how "Critical" or "Reviewed" was displayed, they had to modify 4 different string concatenation functions across `dashboard/script.js`, `evidence/script.ts`, `timeline/script.ts`, and `app.js`. Inevitably, this led to subtle visual discrepancies and styling bugs.

---

#### 3. Your diagram includes components you won't build until later exercises. Why is it useful to design the whole hierarchy now rather than only diagramming what you're about to build?

1. **Top-Down State & Prop Contract Architecture:**
   - Designing the entire application now reveals the data dependencies upfront. We immediately see that `evidence`, `bookmarks`, and `notes` are shared across **Dashboard**, **Evidence**, and **Workspace**. Designing the whole tree ensures our state architecture in Exercises 3 and 4 won't have to be completely torn down or refactored when we build the Workspace in Exercise 5.
2. **Preventing Premature / Redundant Component Creation:**
   - If we only designed the Dashboard today, we might build a narrow `DashboardEvidenceItem`. Later in Exercise 4, we would build a separate `EvidenceCard`. By viewing the whole app, we recognize upfront that both views are rendering the exact same entity with slight style variations (e.g. `compact?: boolean`), allowing us to create a unified, reusable component from day one.
3. **Clear Boundary Definition for Gradual Migration:**
   - A complete architectural blueprint clarifies where the boundary lies between legacy vanilla code and modern React components during the transitional phases. It makes it easy to replace views page-by-page without breaking the shell or global state.
4. **Team Collaboration & Roadmapping:**
   - In a real engineering team, having the entire component hierarchy mapped out allows multiple developers to parallelize work—one developer can work on atomic primitives (`Badge`, `Button`, `Modal`), while others implement page shells or data fetchers, adhering to agreed-upon prop interfaces.

---

## Demo 8 — Architecture Decision Record: why SPA/React

### Tasks

#### 1. Architecture Decision Record (ADR 001)

- **Title:** Adoption of Single-Page Application (SPA) Architecture with React & TypeScript
- **Status:** **Accepted**
- **Date:** October 2026
- **Context:**
  The Project ReMotion Investigation Portal is an analytical investigation dashboard for examining the technical, organizational, and physical evidence surrounding the failure of an AI-assisted rehabilitation robot.
  The portal features:
  - Multi-dimensional, interactive filtering and live text search across evidence logs.
  - Cross-view data synthesis: connecting evidence to timeline events, suspects, and locations.
  - Local state persistence: bookmarking items, annotating evidence with notes, and formulating hypotheses with confidence ratings.
  - An internal/desktop workstation usage profile: investigators spend long, continuous sessions analyzing case files.

- **Decision:**
  We adopt a **Single-Page Application (SPA)** architecture authored in **React 19** with **TypeScript** and bundled via **Vite**.

- **Arguments for why SPA + React is the right architecture for THIS specific app:**
  1. **Rich Client-Side Interactivity & Zero-Latency Cross-Filtering:**
     Investigating an incident requires rapid, continuous hypothesis testing—filtering by date, status, person, and location simultaneously. In an SPA, filtering 50+ evidence items takes less than 1 millisecond directly in browser memory. A multi-page app requiring server round trips for every filter toggle would be jarring and impede investigative flow.
  2. **Coordinated Multi-View State (Declarative UI):**
     State in this app is interconnected: bookmarking an evidence card must immediately update the Dashboard's review progress percentage, highlight the item in the Evidence list, and populate the Workspace's bookmark sidebar. With React's declarative model ($\text{UI} = f(\text{state})$), state updates propagate predictably with surgical DOM patching, completely eliminating the manual DOM querying and innerHTML overwrites that plagued the vanilla codebase.
  3. **High Component Reusability & Consistency:**
     Investigation artifacts (status badges, evidence summary cards, modal overlays, timeline chips) recur across 4 distinct views. React components with TypeScript interfaces guarantee strict design system adherence, type safety, and centralized logic.
  4. **Offline Capability for Sensitive / Air-Gapped Environments:**
     Forensic and safety-critical investigations often take place in disconnected, air-gapped, or field environments. Once the case datasets are loaded, the SPA can operate completely offline in the browser.

---

#### 2. Honest Trade-offs and Downsides of the SPA/React Choice for this App

| Trade-off / Downside | Impact on Project ReMotion | Mitigations |
|---|---|---|
| **Initial Bundle Size & Load Delay** | React 19 + React DOM add ~140 KB (minified/gzipped) to the initial download. The browser must download and execute this runtime before rendering any view. | Mitigated by Vite's production tree-shaking, code-splitting, and caching static bundles via browser HTTP cache. |
| **Total JavaScript Dependency (No Progressive Enhancement)** | If the user has JavaScript disabled or if an adblocker/corporate proxy corrupts script delivery, the user sees a blank screen or broken loading overlay. | Acceptable trade-off for an authenticated, internal analytical tool intended for modern desktop browser environments (not a public marketing site). |
| **Client Memory Overhead** | Keeping all case data, virtual DOM representations, and component closures in RAM can lead to memory bloat over extended investigation sessions. | Implement component unmounting cleanups, avoid memory leaks in event listeners, and use windowed virtualization if datasets scale to thousands of items. |
| **Tooling & Cognitive Complexity** | Requires a compilation toolchain (Vite, TypeScript, JSX transformation) and strict adherence to React mental models (immutability, hook dependency rules, pure rendering). | TypeScript provides compile-time safety and ESLint enforces React hook rules automatically. |

---

### Questions

#### 1. What would you lose by keeping this app as server-rendered vanilla HTML/JS instead? What would you lose by choosing React specifically over a different SPA approach (e.g. vanilla JS with a router, or a lighter library)?

- **What we would lose by keeping this app as server-rendered vanilla HTML/JS (MPA):**
  1. **Instant, fluid responsiveness:** Every filter change, search keystroke, or page switch would require an HTTP request and full page reload, causing white flashes, losing scroll position, and resetting open modals.
  2. **Seamless cross-view draft persistence:** In an MPA, drafting an incident hypothesis in the Workspace while simultaneously navigating to the Timeline to verify an event timestamp requires continuous backend database sync or session persistence. In an SPA, draft state resides naturally in memory and `localStorage`.
  3. **Offline investigation capability:** An MPA cannot function without an active network connection to the server on every click.

- **What we lose by choosing React over a lighter SPA library (e.g. Preact, Svelte, Lit) or Vanilla JS + Router:**
  1. **Bundle Weight & Runtime Overhead:**
     - Preact (~3 KB) or Svelte (which compiles away with no runtime) produce significantly smaller JavaScript payloads than React (~40+ KB minified core).
     - Vanilla JS has zero library download cost and zero third-party dependencies.
  2. **CPU Overhead of Virtual DOM Diffing:**
     - React must construct in-memory object trees and calculate diffs on every render. Modern reactive frameworks (like Svelte or SolidJS) compile templates into fine-grained native DOM mutations, achieving faster execution with zero Virtual DOM overhead.
  3. **Cognitive Overhead & Hook Footguns:**
     - Vanilla JS or simpler reactive libraries avoid React's nuances (e.g. hook rules, dependency array bugs, stale closures, and unintentional re-render cascades).

---

#### 2. If this app needed to support users on very low-end devices or poor connections as a hard requirement, would you stick with SPA or change the architecture? Why or why not?

- **The Architectural Verdict:**
  **We would change the architecture away from a pure Client-Side Rendered (CSR) SPA.**

- **Why a CSR SPA fails on low-end devices & poor connections:**
  1. **The Sequential Network Waterfall:**
     As demonstrated in Demo 2, our CSR SPA requires multiple sequential network round trips before rendering anything:
     $$\text{HTML shell} \longrightarrow \text{JS bundles (150KB+)} \longrightarrow \text{JSON data files} \longrightarrow \text{Dynamic view templates}$$
     On a poor 2G/3G mobile network with high latency (e.g. 400ms+ round-trip time) and packet loss, this multi-stage waterfall can take **15 to 30 seconds** before the first readable pixel appears.
  2. **Device Hardware Bottlenecks (CPU & RAM):**
     Low-end devices (budget phones or legacy terminals with 1 GB RAM and low-tier CPUs) struggle with JavaScript parsing, bytecode compilation, and garbage collection. Decompressing and executing megabytes of JS chokes the main thread, causing severe input lag, battery drain, and out-of-memory crashes.

- **What architecture we would adopt instead:**
  - **Server-Side Rendering (SSR) with Progressive Enhancement (or Islands Architecture, e.g. Astro / Remix):**
    - **Instant First Paint:** The server pre-renders complete, readable HTML for the case details and evidence logs. On Round Trip 1, even the slowest phone displays readable content immediately with near-zero CPU effort.
    - **Selective / Partial Hydration:** JavaScript is shipped **only** for the interactive controls that strictly require it (e.g. the confidence slider or bookmark star), reducing client JS payloads from hundreds of kilobytes down to under 10–15 KB.
    - **Graceful Fallback:** Basic navigation and filtering can fall back to standard HTML `<form action="/evidence" method="GET">` queries if JavaScript fails entirely.

---

## Demo 9 — Migrate the application shell

### Tasks Completed

1. **Built the Application Shell in React + TypeScript:**
   - [Header.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/Header.tsx):
     - Displays brand logo (`./assets/logo/logo.svg`), Case Title (*Project ReMotion*), Subtitle (*Investigate the failure of an AI-assisted rehabilitation robot.*), and an active **React Shell (Demo 9)** badge.
     - Implements accessible navigation buttons (`Dashboard`, `Evidence`, `People & Locations`, `Timeline`, `Workspace`) with dynamic `className={`nav-btn ${isActive ? 'active' : ''}`}` and `aria-current={isActive ? 'page' : undefined}`.
     - Includes a coexistence switch button (`← Vanilla App`) allowing investigators/evaluators to jump to the legacy Vanilla JS app.
   - [Footer.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/Footer.tsx):
     - Implements the persistent footer matching the design system token classes (`.app-footer`).
   - [StubView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/StubView.tsx):
     - Reusable stub view component for views whose migration is planned for future phases (Evidence Locker, People & Locations, Timeline, and Workspace).
     - Renders distinctive icons, migration status pills, descriptions, component hierarchy roadmap notes, and an action button to jump directly into the legacy Vanilla view.
   - [DashboardStub.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/DashboardStub.tsx):
     - Serves as the home view for the application shell in Demo 9, displaying incident status, routing status cards, and interactive test buttons across all views + an explicit 404 test route (ready for full data migration in Demo 10).
   - [NotFoundView.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/components/NotFoundView.tsx):
     - Explicit 404 handler component displaying the unrecognized route string, an architectural explanation contrasting it with Vanilla's silent fallback, and a "Return to Dashboard" action button.
   - [ReactApp.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/ReactApp.tsx):
     - Root application shell component managing routing state with `useState` and synchronizing with `window.location.hash` via `useEffect` listening to `hashchange`.
     - Declaratively selects and renders the active view inside `<main className="app-main">`.
   - [navigation.ts](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/types/navigation.ts):
     - Strongly typed view keys (`ViewKey = 'dashboard' | 'evidence' | 'people' | 'timeline' | 'workspace'`) and navigation item configurations.

2. **Wired up Route Navigation & Clean Coexistence:**
   - Navigating between views updates the URL hash (e.g. `#react/dashboard`, `#react/evidence`, `#react/people`, `#react/timeline`, `#react/workspace`).
   - Browser Back and Forward buttons update the URL hash, which triggers the `hashchange` listener in `ReactApp.tsx`, updating `currentView` and re-rendering the view automatically.
   - In [src/index.html](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/index.html), the legacy Vanilla layout is wrapped in `<div id="vanilla-root">`. When navigating to any React route, `#vanilla-root` is hidden and `#react-root` is displayed. When switching back to Vanilla, `#react-root` is hidden and `#vanilla-root` is restored with zero layout clashing or duplicate headers/footers.

---

### Questions & Analysis

#### 1. How does "the current view" get tracked in your React shell? Compare this directly to how `currentPage` and `handleHashChange()` did it in the vanilla version? What's actually different, and what's superficially different but conceptually the same?

##### A. How View Tracking Works in the React Shell

In [ReactApp.tsx](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/ReactApp.tsx):
1. **Reactive State Storage:**
   The active view is held in standard React component state:
   ```tsx
   const [currentView, setCurrentView] = useState<string>(() => {
     return extractViewFromHash(window.location.hash).view;
   });
   ```
2. **Browser Hash Synchronization:**
   A `useEffect` hook attaches an event listener to the browser's `hashchange` event upon mounting and properly detaches it when unmounting:
   ```tsx
   useEffect(() => {
     const syncHashToView = () => {
       const { isReact, view } = extractViewFromHash(window.location.hash);
       if (isReact) setCurrentView(view);
     };
     window.addEventListener('hashchange', syncHashToView);
     return () => window.removeEventListener('hashchange', syncHashToView);
   }, []);
   ```
3. **Declarative Rendering:**
   When `setCurrentView(view)` is invoked (either via button click or URL change), React schedules a re-render. The shell component evaluates:
   - `<Header currentView={currentView} onNavigate={navigateToView} />` (which highlights the active nav button via `className={`nav-btn ${isActive ? 'active' : ''}`}`)
   - `{renderContent()}` inside `<main className="app-main">`, which returns the matching view component (`<DashboardStub />`, `<StubView />`, or `<NotFoundView />`).

---

##### B. Direct Comparison Table: Vanilla vs. React Shell

| Architectural Dimension | Vanilla Implementation (`app.ts`) | React Implementation (`ReactApp.tsx`) |
| :--- | :--- | :--- |
| **State Storage** | Global mutable property on a shared object: `state.currentPage = view`. | Component-scoped reactive hook: `const [currentView, setCurrentView] = useState(...)`. |
| **State Mutation** | Imperative assignment: direct variable overwrite (`state.currentPage = view`). | Declarative setter dispatch: `setCurrentView(view)` enqueued to the React Fiber reconciler. |
| **UI Update Trigger** | Manual procedural calls: sequentially invoking DOM queries and helper functions (`classList.toggle`, `innerHTML = ...`, `viewInitFn()`). | Automatic reactive re-render: state change triggers component function re-execution and Virtual DOM reconciliation. |
| **Nav Button Active State** | Imperative DOM query & class toggle: `document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-view') === view))`. | Declarative JSX expression: `className={`nav-btn ${currentView === item.id ? 'active' : ''}`}` evaluated directly in the render loop. |
| **View Content Insertion** | Destructive string injection: `appContainer.innerHTML = htmlModule.default`, wiping all existing DOM nodes and attached event listeners. | Declarative component mounting: `{renderContent()}` returning typed JSX components, preserving unmodified DOM nodes. |
| **Lifecycle & Cleanup** | Manual element lookup and manual event wiring; high risk of memory leaks if previous listeners are not unwired. | Declarative `useEffect` cleanup return function: `return () => window.removeEventListener(...)`. |

---

##### C. What is Superficially Different vs. What is Conceptually the Same?

- **Superficially Different (Syntax & Mechanics):**
  1. *State Mutation Syntax:* In Vanilla, we write `state.currentPage = view`. In React, we call `setCurrentView(view)`. Under the hood, React's setter does not merely store a string; it marks the component dirty on the Fiber work queue and triggers a re-render.
  2. *DOM Class Highlighting:* In Vanilla, we imperatively query `.nav-btn` elements via `document.querySelectorAll` and call `classList.toggle('active')`. In React, we pass `currentView` as a prop and use JSX template interpolation (`nav-btn ${isActive ? 'active' : ''}`).
  3. *View Swapping:* In Vanilla, we import raw HTML string modules and assign them to `appContainer.innerHTML`. In React, we return typed component functions (`<DashboardStub />`, `<StubView />`).

- **Conceptually the Same (Underlying SPA Architecture):**
  1. *URL Hash as the External Single Source of Truth:* Both architectures treat `window.location.hash` as the browser's navigation anchor. Both listen to the exact same browser event: `window.addEventListener('hashchange', ...)`.
  2. *Hash Parsing to View Identifiers:* Both systems extract a route token from the hash string (e.g. stripping `#` or `react/`) and map that token to a corresponding view.
  3. *History Stack Integration:* Both rely on the browser's standard history stack (`window.history`), enabling seamless Back and Forward button navigation without reloading the webpage.
  4. *Two-Way State Synchronization:* Both require keeping the visual UI (the active navigation button highlight and main view container) strictly in sync with the current URL.

---

#### 2. What happens in your shell if a user navigates to a view that doesn't exist? How does that compare to the vanilla app's fallback-to-dashboard behavior?

##### A. Behavior in the React Shell

In our React shell:
1. If a user navigates to an unrecognized URL (e.g. `#react/quantum-telemetry` or clicks an outdated bookmark):
   - The hash parser extracts `'quantum-telemetry'` as the requested view.
   - `renderContent()` executes the `switch (currentView)` statement.
   - Because `'quantum-telemetry'` does not match `'dashboard'`, `'evidence'`, `'people'`, `'timeline'`, or `'workspace'`, execution lands in the `default` branch:
     ```tsx
     default:
       return (
         <NotFoundView
           attemptedRoute={`#react/${currentView}`}
           onNavigateHome={() => navigateToView('dashboard')}
         />
       );
     ```
2. **The User Experience:**
   - The user sees a dedicated, clean **404 — View Not Found** card with an amber/red warning header.
   - The card displays the exact route string that was attempted (`#react/quantum-telemetry`).
   - The card provides an explanatory message informing the user that the view does not exist.
   - A prominent primary button (**"Return to Dashboard"**) allows the user to immediately navigate back to a valid state with a single click.

---

##### B. Comparison to the Vanilla App's Fallback-to-Dashboard Behavior

In the Vanilla application ([app.ts](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/src/app.ts)):
```ts
if (!routes[view]) {
  view = 'dashboard';
}
state.currentPage = view;
```
When an unrecognized route was entered, Vanilla **silently redirected** to `'dashboard'`.

##### C. Architectural Evaluation of the Trade-Off

| Factor | Vanilla Silent Fallback (`view = 'dashboard'`) | React Explicit 404 (`<NotFoundView />`) |
| :--- | :--- | :--- |
| **User Transparency** | **Poor / Confusing:** The user is dumped onto the Dashboard with zero explanation. If they clicked a link expecting Evidence or People, they have no idea why they are looking at the Dashboard. | **High:** Explicitly communicates that the requested resource could not be found, avoiding confusion. |
| **URL vs UI Synchronization** | **De-synchronized:** The browser URL bar retains `#unknown-route`, but the UI renders the Dashboard. The URL indicates one thing while the screen displays another. | **Synchronized:** The URL (`#react/unknown-route`) accurately corresponds to the 404 View displaying the error for that exact route. |
| **Developer Debugging** | **Masks Errors:** Broken internal links or typos in `onclick="navigateTo('evidenc')"` quietly fall back to the dashboard, making routing bugs hard to spot during testing. | **Surfaces Errors Immediately:** Broken links instantly trigger the 404 card, making invalid routes immediately detectable during QA and automated testing. |
| **User Agency & Recovery** | **Disorienting:** Assumes intent on behalf of the user without confirmation. | **Actionable:** Gives the user clear context and a dedicated recovery action ("Return to Dashboard"). |

**Conclusion:**
While a silent fallback may appear "resilient" at first glance, in professional web applications it violates the principle of least astonishment, masks broken navigation links, and causes state de-synchronization. The React shell's explicit 404 handler is significantly superior for usability, accessibility, and maintainability.







