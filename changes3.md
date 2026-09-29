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
