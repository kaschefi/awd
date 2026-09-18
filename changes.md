- ***EX1***

 ***DEMO 1***
  well in demo 1, i created a src file first, then created a page folder and in that one each page got its own folder,in that    folder there is an index.html and script.js for each of the pages, i also though it would make sense to seperate the state and utils from the app so that the app would only load data and also act as the router, i could also seperate this two in two files   but since we only have 5 pages, but for scaleability i could seperate them too 

  ***DEMO 2***

  i dont know if this bug was a thing before the seperation or not but in the evidence the site is not loading and it has nothing to do with the copy vs refrence that problem should probably happen when we update a variable and another varible get updated with it.
  i have read the demo 3 and the evidence not loading is actually because of that. so i rather do that first and then come back to the demo 2 bug.
  im writing this after demo3 fix and im still unable to find a visible bug that can be aboutcopy vs refrence thing. but i have seen  sorting the evidences is not working at all.

  ok so i found what the bug should have been but the demo 5 fix it. here is the fix in detail:

  - **What the bug was:**
    In `loadEvidenceData()`, the initial assignment was:
    `filteredEvidence = allEvidence;`
    In JavaScript, objects and arrays are assigned by reference, not copied by value. This meant `filteredEvidence` and `allEvidence` pointed to the exact same array in memory.
    When `handleSortChange()` ran `.sort()`, it sorted the array in place, which also mutated `allEvidence`! This broke the Dashboard because the Dashboard relies on `allEvidence` keeping its original chronological order for "Recent evidence".
  - **Why we didn't need a separate code change:**
    When fixing the sorting bug in **Demo 5**, we moved the sorting logic into `getFilteredEvidence()`, where items are pushed into a brand new array (`var results = []`) and only `results` is sorted.
    Because a new array copy is created and sorted, `allEvidence` is never touched or mutated. Thus, **the Demo 5 fix automatically resolved the Demo 2 reference/mutation bug as well!**
  - **Theory (Reference vs. Copy):**
    Primitives (numbers, strings, booleans) are copied by value. Arrays and objects are copied by reference. When you assign an array to another variable (`a = b`), you only copy the pointer. In-place operations like `.sort()` or `.reverse()` mutate the underlying array for all references. To avoid this, an explicit copy must be made (e.g. `arr.slice()` or `[...arr]`).

  ***DEMO 3***

  Root cause was that the evidenceViewLoading is set to true on startup. renderEvidenceList() checks this flag first — if it's true, it shows the spinner and returns early, never rendering the list. The flag was supposed to be cleared to false inside the .then() callback of loadEvidenceData(), once the fetch resolved and the data was ready. But that line was simply missing. Because the fetch is async, the flag was checked (still true) before the data ever arrived — and it was never reset afterward, so the spinner stayed forever.

  ***DEMO 4***

  ok so first thing that i see in devtools is :
  First note preview: 
  Promise {<fulfilled>: ''}
  [[Prototype]]
  : 
  Promise
  [[PromiseState]]
  : 
  "fulfilled"
  [[PromiseResult]]
  : 
  ""  lets see where that happend
  i found it, it is in the app.js
      var firstNote = loadNoteAsync("E01");
      console.log("First note preview:", firstNote);

  Because loadNoteAsync is asynchronous, it returns a Promise object (a wrapper), not the note string itself

  Because the code didn't wait for the Promise with .then() or await, JavaScript immediately passes the unresolved Promise object straight into console.log:

  so for the fix i will just add an await 
  and now we just get First note preview: 

  for the second bug we can go to the timeline and click one of the view, we get this log: modal opened, active close listeners: 1

  if we do the same again and again 
  modal opened, active close listeners: 2
  modal opened, active close listeners: 3
  modal opened, active close listeners: 4
  how ever it should have stayed 1 because now when i close it, it run 4 functions and not its 1 function 
  you can see the code in the line 111 of the timeline file 
  i fixed it by using .onclick instead of add event listener and not closing it later.

  ***DEMO 5***

  for demo 5 im gonna fix the sort problem in evident, reproducing the bug it easy, go to evidence and try to sort it for newest or lodest or a-z, z-a. no matter what, it doesnt work.
  handleSortChange() sorts state.filteredEvidence.
  Then it calls renderEvidenceList().
  But the very first thing renderEvidenceList() does is call getFilteredEvidence(), which re-filters and resets state.filteredEvidence from scratch without applying the sort The sort is completely wiped out before the HTML is generated.
  so i just moved the sorting inside the getFilteredEvidence function which it just fixed the demo 2 :). 

  ***DEMO 6***
  for this demo i watched a tutorial on the browser debugger and how to use breakpoints, stepping, and call stacks live in devtools.
  here are the answers to the questions:
  - difference between "Step over" and "Step into":
    "Step over" (F10) moves to the next line in the current function without entering functions called on that line.
    "Step into" (F11) jumps inside the function being called.
    example where using the wrong one wastes time: in `getFilteredEvidence`, if you are looping through evidence and you accidentally hit "Step into" on `evidenceMentionsPerson(...)` or `formatDate(...)`, you get dragged into helper functions and native library internals for 10 steps instead of just moving to the next item in your loop.
  - what is the call stack and how it helps:
    the call stack shows the active chain of function calls leading up to where execution is currently paused (who called what).
    it helps you trace backwards: if a function runs with unexpected arguments or at the wrong time, looking at the call stack immediately shows the exact caller and the scope/variables of every parent function on the stack.
  - conditional breakpoints vs hitting resume:
    a conditional breakpoint only pauses when a specific expression is true (like `item.id === "E05"`).
    if you have an array of 50 items and only care about item #40, a regular breakpoint forces you to hit resume 39 times manually, which is slow and easy to overshoot. a conditional breakpoint skips straight to the one you care about.
  - breakpoint in DevTools UI vs `debugger;` statement:
    a breakpoint in DevTools is temporary, doesn't modify source files, and can be toggled on/off without restarting.
    `debugger;` is hardcoded into your `.js` source file. it's useful if you have dynamic code or want to make sure every teammate hits the pause at that exact line, but you must remember to delete it before committing so it doesn't trigger in production.
  - when console.log was not enough, but the debugger was:
    with `console.log`, objects are evaluated asynchronously in the console, or you only get snapshots of values at one moment in time. with the debugger, you can pause time, inspect closures, view local and module scope simultaneously, and even change variable values live in the Scope panel to test a fix before writing any code.
  ***DEMO 7***
  for demo 7, i explored the main DevTools tabs: Console, Network, Application, and Elements.
  here are the answers to the questions:
  - Console log-level filters and "Preserve log":
    the log-level dropdown allows filtering messages by Verbose, Info, Warnings, and Errors.
    "Preserve log" keeps the console history across page reloads and navigations. normally, when a page reloads, the console clears immediately. with "Preserve log" checked, you can debug issues that happen right before or during an unload/reload.
  - Network tab, status codes, payload, and throttling:
    in the Network tab, inspecting a request like `evidence.json` shows:
    - Status code (e.g. 200 OK or 304 Not Modified).
    - Response body (the parsed JSON data).
    - Timing breakdown (DNS lookup, TCP handshake, TTFB - Time to First Byte, and download time).
    throttling to "Slow 3G" simulates a slow mobile connection. on our app, loading the unoptimized PNG images took over 12 MB and took seconds to pop in, which shows why converting them to WebP (saving 93% bandwidth) is so important.
  - Application / Storage tab (localStorage) and invalid JSON:
    localStorage stores simple key-value string pairs.
    in DevTools, you can view keys like `remotion_bookmarks` or `remotion_notes`, edit them directly, or delete them.
    if you replace a value with invalid JSON (e.g. just raw text like `abc` instead of valid JSON string/array), when the app reloads, `JSON.parse()` throws a `SyntaxError`. our code in `loadBookmarksFromStorage()` wraps this in a `try / catch` block, so it gracefully catches the error, resets the storage, and prevents the app from crashing.
  - Elements tab vs code that generated it:
    the Elements tab shows the live DOM tree as currently rendered by the browser, including dynamic classes like `.active` and injected card HTML.
    inspecting an evidence card in the DOM directly connects back to `renderEvidenceCardHTML(ev)` in `evidence/script.js`, showing how JavaScript template strings are turned into real DOM nodes.


  ***DEMO 8***

  in the original app.js we had a lot of top-level var variables that were global and here is what could go wrong with 3 of them:

  1. currentPage: this is a super generic name, if another script or library also uses a variable called currentPage, it would overwrite our navigation state without any warning and break the whole routing.
  2. bookmarks: also a very common name. if someone creates another bookmarks list in another file or forgets the var keyword, it would overwrite the main bookmarks array and mess up our saved data.
  3. STORAGE_KEY_*: these were defined with var instead of const, meaning they could easily be reassigned by accident anywhere in the code (like STORAGE_KEY_BOOKMARKS = "wrong_key") and corrupt our localStorage.

  how i fixed it: 
  with the module split in demo 1, variables are scoped to their own module and don't leak into the global window object anymore. i moved the shared data into state.js under one state object, and changed the storage keys to const exports so nobody can reassign them.


  for the code smells **one of them** is the classic code injection, when we use innerHTML with the user input as a value without cleaning it it would lead to a xss attack. we can just fix it with using textContent.
  the code was in line 300 of the evidence/script.js.

  for the **second code smell**, we had a classic closure bug with var inside a loop in app.js (line 179). it was using `for (var i = 0; i < navButtons.length; i++)` to add click listeners to the nav buttons. because `var` is function-scoped and not block-scoped, all the click callbacks shared the exact same `i`. by the time you actually click a button, the loop has already finished, so `i` equals `navButtons.length` and `navButtons[i]` is undefined. i fixed it by replacing the loop with `navButtons.forEach(btn => ...)` so each button has its own scoped reference. 

  and well for changing the var to the const or let, we already learned the rule for that in second semester, the default it const, and we only use let if we really have to, when the value is going to change, like a variable in a loop.

  ***DEMO 9***

  in this demo i refactored the a nested Promise chains to async/await the point of doing it is to make it simplere to read, to make it feel like its synchronous:

  1. loadCorePeopleAndLocations():
  this was the most deeply nested chain in the app. it was 6 levels deep:
  fetch case.json -> parse json -> fetch people.json -> parse json -> fetch locations.json -> parse json -> hideLoadingStep().
  every request had to wait for the previous one to finish before it even started, creating a giant callback pyramid (which is also called "pyramid of doom").
  i refactored it to an async function with sequential await statements. it does the exact same thing in the exact same sequential order, but it reads top-to-bottom like regular synchronous code.

  2. loadTimelineData():
  this function used .then(), .catch(), and .finally().
  i converted it to an async function using a standard try / catch / finally block, keeping all the original error logging and hideLoadingStep() cleanup.

  3. answers to the theory questions:
  - why nested .then() is harder: with nested callbacks, you constantly indent to the right, variable scoping gets confusing across levels, and error handling requires either chaining or multiple error handlers. async/await lets you write linear, readable code.
  - what await actually does: it pauses the execution of that specific async function until the Promise settles. while it is waiting, the JavaScript event loop is free to handle other tasks (UI rendering, user clicks, other events).
  - async functions always return a Promise: even if a function does `return "hello"`, wrapping it in `async` means calling it returns a `Promise { <resolved>: "hello" }`. if you call `.then()` on it, you get the resolved value inside the callback.
  - the equivalent of .catch(): a `try { ... } catch (err) { ... }` block. if you forget it and an awaited promise rejects, you get an `UnhandledPromiseRejection` runtime error in the console.
  - is async/await faster?: no, under the hood it uses the same Promise microtask queue. it does not make network requests faster, it is purely syntactic sugar for readability and code organization.
  - removing an await: if you remove `await` from `const caseRes = fetch(...)`, then `caseRes` is a Promise object instead of the Response. calling `caseRes.json()` immediately crashes with an error because `.json()` doesn't exist directly on a Promise wrapper. this is the exact same type of bug we saw in Demo 4 with `loadNoteAsync`.

  ***DEMO 10***

  in this demo i refactored functions to modern arrow functions:

  1. functions converted to arrow functions:
  - statCardHTML in dashboard/script.js:
    before: function statCardHTML(value, label) { return ... }
    after: const statCardHTML = (value, label) => ...
    it's a pure helper that just formats a template, so making it an arrow function makes it clean and short.
  - array .sort() callbacks in evidence/script.js:
    before: results.sort(function(a, b) { return ... })
    after: results.sort((a, b) => a.title.localeCompare(b.title))
    arrow functions are ideal for array callbacks because you don't need the function keyword or return statement for single expressions.
  - event listeners in evidence/script.js:
    converted the change callbacks for detailStatusSelect and detailRelevanceSelect to `(e) => { ... }`.

  2. function i deliberately did NOT convert:
  any function where we would need dynamic `this` bound to the DOM element (for example, if an event listener uses `this.classList.toggle(...)`).
  arrow functions do NOT have their own `this` binding — they inherit `this` lexically from their surrounding scope. so if a function relies on `this` pointing to the clicked button or input, converting it to an arrow function breaks it.
  also, top-level function declarations (`function init() {}`) are hoisted to the top of the file. if you convert them to `const init = () => {}`, they are not hoisted, so calling them before they appear in the file causes a ReferenceError.

  3. answers to theory questions:
  - arrow functions vs regular functions with `this`: regular functions bind `this` based on how they are called (e.g. the element receiving an event). arrow functions do not have their own `this`, they capture `this` from the enclosing lexical scope. that makes arrow functions dangerous when you expect `this` to be the object or DOM element, but great as callbacks (like inside setTimeout or Promise chains) where you don't want `this` to accidentally change.
  - no `arguments` or `new`: arrow functions cannot be used as constructors with `new`, and don't have the magic `arguments` object (you have to use rest parameters `(...args)` instead).
  - hoisting: function declarations can be called anywhere in the file (even above their definition). `const` arrow functions cannot be called before the line where they are defined (Temporal Dead Zone).
  - rule for the team on when to use which:
    - use **arrow functions** for short callbacks (like `.map()`, `.filter()`, `.sort()`, inline event listeners) and small pure helpers.
    - use **standard function declarations** (`function foo() {}`) for top-level component functions, exported module functions, or whenever you need hoisting or a dedicated `this`.

***EX2***

***DEMO 1***

I chose **pnpm** over npm because its content-addressable storage saves significant disk space and speeds up installations via hard links. In addition, its strict, non-flat `node_modules` structure uses symlinks to prevent "phantom dependencies" by ensuring code can only access packages explicitly declared in `package.json`.

Initialized `package.json` with project metadata (`remotion-investigation-portal`, version, description, `"type": "module"`, `"private": true`).

Created `.gitignore` to exclude `node_modules/`, build outputs (`dist/`), logs, and system files from version control.

Installed `clsx` as a lightweight runtime dependency (`pnpm add clsx`), generating `pnpm-lock.yaml` to pin exact dependency versions and integrity hashes.

**Demo 1 Questions & Answers:**

1. **What problem does a package manager actually solve that "download the library and put it in a folder yourself" doesn't?**
   - **Transitive dependency resolution:** When you download a library manually, you must also find, download, and maintain every dependency *that* library requires (the dependency tree). A package manager resolves and downloads the entire recursive tree automatically.
   - **Version conflict management:** It resolves semantic versioning ranges across different libraries so they don't overwrite or conflict with each other.
   - **Updates and security:** Updating dependencies or patching security vulnerabilities is a single command (`pnpm update` / `pnpm audit`) rather than manually hunting down updated files.
   - **Reproducibility & clean repos:** The codebase stays small in Git (no vendor binaries committed); anyone can reproduce the identical environment from the manifest and lockfile.

2. **What's the difference between `dependencies` and `devDependencies` in `package.json`? Which category will Vite, your linter/formatter, and TypeScript belong to, and why?**
   - **`dependencies`** are packages needed by the application at runtime in production (e.g., UI libraries, helper utilities like `clsx`). They are bundled and shipped to the user's browser.
   - **`devDependencies`** are tools only needed during local development, testing, and building (compilers, bundlers, linters).
   - **Vite, ESLint/Prettier, and TypeScript belong in `devDependencies`** because they only run at build/development time on our machine or in CI. The end user's browser executes only the compiled, minified JavaScript output generated by Vite, not Vite, TypeScript, or ESLint themselves.

3. **What is a lockfile for, and what could go wrong for your teammates (or CI) if it weren't committed to the repo?**
   - A lockfile (`pnpm-lock.yaml`) records the exact version of every direct and transitive dependency resolved, along with its download URL and cryptographic integrity hash (checksum).
   - `package.json` usually contains version ranges (e.g., `^2.1.0`). Without a lockfile committed, running install on a teammate's machine or in CI a week later could pull a newly released minor or patch version that introduces bugs or breaking changes. This causes the classic "works on my machine" failure. The lockfile guarantees that every machine builds against the exact same bytes.

4. **If you chose pnpm: what does it do differently from npm regarding how `node_modules` is laid out and how disk space/install time is shared across projects?**
   - **`node_modules` layout (strict vs. flat):** npm flattens/hoists all dependencies to the root `node_modules`, creating "phantom dependencies" (your code can accidentally import packages you never declared in `package.json`). pnpm uses a nested virtual store (`node_modules/.pnpm`) and symlinks: only packages explicitly declared in `package.json` are accessible in the root `node_modules`, preventing phantom dependencies.
   - **Disk space & install time:** npm copies package files over and over for every project. pnpm maintains a single global content-addressable store on the machine and uses hard links to link files into projects. If multiple projects use the same package version, it is stored only once on disk, saving gigabytes of storage and making installs near-instantaneous.

***DEMO 2***

- Installed **Vite** (`pnpm add -D vite`) and configured `vite.config.js` with `root: 'src'`, `publicDir: '../public'`, and `build.outDir: '../dist'`.
- Added `dev`, `build`, and `preview` scripts to `package.json`.
- Restructured project files:
  - Moved `data/` and `assets/` into `public/` so that runtime static assets and images are accessible at `/data/...` and `/assets/...` in both dev server and production builds.
  - Removed legacy root `index.html` and `app.js` from before Exercise 1, making `src/` the single source of truth.
  - Fixed relative asset and data paths to `/assets/` and `/data/`.
- Verified that Vite dev server runs at `http://localhost:5173/` with full functionality across all views (Dashboard, Evidence, People & Locations, Timeline, and Workspace).

**Demo 2 Questions & Answers:**

1. **What is the difference between how you used to run this app (a plain static file server) and running it through Vite's dev server? Name at least one thing Vite's dev server does that a plain static server doesn't.**
   - A plain static server (e.g. `python -m http.server`, `npx serve`) merely streams files byte-for-byte from disk over HTTP. It performs no module transformations, has no concept of module graphs, cannot resolve packages in `node_modules`, and cannot push updates to the browser.
   - Vite's dev server is an active development server that:
     - **Resolves bare module imports:** Browsers cannot natively resolve `import clsx from 'clsx'` because they do not know how to look into `node_modules`. Vite intercepts and rewrites bare specifiers into browser-valid URLs (e.g. `/@fs/.../node_modules/clsx/...`).
     - **Pre-bundles dependencies with esbuild:** Converts CommonJS/UMD dependencies to ESM and bundles packages with hundreds of internal files into single modules to prevent browser request waterfalls.
     - **Maintains a persistent WebSocket connection:** Directly notifies and updates the browser when files change for Hot Module Replacement (HMR).

2. **What is Hot Module Replacement, and what specifically did you observe happen (and *not* happen, e.g. to app state) when you triggered it?**
   - **What HMR is:** A development feature where Vite watches source files, re-transforms only the changed module, and delivers the update over WebSocket to the running browser runtime, swapping the old code/style with the new code without a full page reload.
   - **What specifically happened:**
     - The modified style or component updated instantly on screen.
     - Only the specific edited file was re-fetched over the network as a small payload.
   - **What did *NOT* happen:**
     - The browser did **not** perform a full page reload (no white flash, the URL and reload icon remained untouched).
     - **Application state was preserved:** Loaded case data, selected filters, active tabs, form inputs, and in-memory bookmark state remained intact without being reset to initial values.

3. **Why does an app already split into ES modules (Exercise 1) integrate naturally with a tool like Vite, compared to the original single-`<script>` version?**
   - **Native ESM compatibility:** Vite's dev server is designed around the browser's native `<script type="module">` support. It does not bundle code during development; instead, it serves modules on demand as the browser imports them.
   - **Fine-grained module graph:** Because the app was already separated into clean ES modules (`state.js`, `utils.js`, specific page scripts) with explicit `import`/`export` boundaries, Vite constructs a precise dependency graph. When a single file is edited, Vite only invalidates that exact file and its direct consumers, making re-compilation and HMR instantaneous.
   - In contrast, a monolithic single-`<script>` architecture has everything in one global scope. Changing any single function requires reloading the entire script and state, losing all benefits of module-level caching and granular HMR.

***DEMO 3***

**The Problem Encountered & The Fix:**
- **Problem:** In dev mode, page views loaded via runtime string paths: `fetch('pages/dashboard/index.html')` and `import('./pages/dashboard/script.js')`. When running `vite build`, Vite/Rollup cannot statically trace dynamic string URLs passed into `fetch()`, so the `pages/` templates and scripts were omitted from the production `dist/` directory. Running `vite preview` caused view navigation to fail with 404 errors.
- **Fix:** Refactored `routes` in `src/app.js` to use Vite dynamic imports with `?raw` for HTML templates (e.g. `loadHtml: () => import('./pages/dashboard/index.html?raw')`) and dynamic module imports (e.g. `loadModule: () => import('./pages/dashboard/script.js')`). This enables Vite to statically trace all views, bundle HTML directly into the build, and generate separate code-split chunks for each page in `dist/assets/`.

**Production Build & Inspection:**
- Ran `pnpm build` (`vite build`), which completed in ~200ms and generated:
  - `dist/index.html` (2.01 kB, minified entry point)
  - `dist/assets/index-ZAWMSz9M.css` (11.44 kB / 2.77 kB gzip, minified CSS bundle)
  - Code-split JavaScript chunks for each page with content hashes (e.g. `dashboard-*.js`, `evidence-*.js`, `timeline-*.js`, `workspace-*.js`, `people_locations-*.js`, `utils-*.js`)
  - `dist/data/` and `dist/assets/` copied from `public/`.
- Served the build with `pnpm preview` (`vite preview`) and confirmed that all 5 views load and work end-to-end without errors.

**Comparison (Dev vs. Built Output):**
- **File: `src/styles.css` vs `dist/assets/index-ZAWMSz9M.css`**:
  - Dev source: 853 lines, 15.3 KB with comments, whitespace, and human-readable formatting.
  - Built output: 1 minified line, 11.4 KB (2.77 KB gzip); all comments and unnecessary whitespace stripped, selectors consolidated, and filename hashed.
- **File: `src/app.js` vs `dist/assets/index-CFC5Nm62.js`**:
  - Dev source: 190 lines, 6.4 KB with descriptive variable names and comments.
  - Built output: 1 minified line; identifier names mangled to short symbols, imports bundled, and template strings minified.

**Demo 3 Questions & Answers:**

1. **Name at least three concrete transformations Vite applied to your source when building for production:**
   - **Bundling & Code Splitting:** Combined imported modules into optimized chunks; inlined HTML view templates (`?raw`) into JavaScript chunks, and split views into separate dynamic chunks that only load on demand.
   - **Minification & Tree-Shaking:** Stripped all whitespace, newlines, and comments from CSS and JS, mangled identifiers to short names, and eliminated unused exports.
   - **Asset Content-Hashing:** Appended unique cryptographic hashes to output filenames (e.g. `index-ZAWMSz9M.css`, `index-CFC5Nm62.js`).

2. **Why do production filenames typically include a content hash? What problem does that solve for real deployments?**
   - It solves the problem of **stale browser caching while enabling aggressive long-term caching** (`Cache-Control: immutable, max-age=31536000`).
   - If filenames were static (e.g. `app.js`), updating code and deploying would cause returning users to see broken or outdated apps because their browsers would serve the cached `app.js` file from disk.
   - With content hashes, whenever file contents change, the hash changes (`index-ABC.js` -> `index-XYZ.js`). The new `index.html` references the new filename, forcing the browser to download the update immediately. Files that didn't change keep their hashes and are served instantly from cache.

3. **Why would you never want to deploy the dev server itself (`vite dev`/`vite`) to real users, even though it "works"?**
   - **Performance & Request Cascades:** In dev mode, files are unbundled and served individually on demand. A user loading the app would trigger dozens of individual HTTP requests, causing severe latency and request waterfall delays.
   - **Bandwidth & Resource Overhead:** Dev mode serves unminified code, whitespace, source maps, and the internal Vite HMR client (`/@vite/client`), significantly increasing download sizes and memory usage.
   - **No Long-Term Caching:** Files in dev mode do not have content hashes, meaning CDNs and browsers cannot cache them safely and effectively.
   - **Server Security & Stability:** Vite dev server is designed for local development; it includes file watchers, exposed WebSocket connections, and lack of DDoS resilience or production-grade HTTP connection pooling.

***DEMO 4***

| Tool | Focus | What it checks | Real example from our project |
| :--- | :--- | :--- | :--- |
| **ESLint** *(Linter)* | **Code Correctness & Quality** (Logic bugs) | Bugs, unused variables, undefined variables, dead code, risky patterns. | Caught `const term = ...` in `evidence/script.js` that was created but never used (wasting memory / leftover logic error). |
| **Prettier** *(Formatter)* | **Code Aesthetics & Style** (Visual consistency) | Line lengths, spacing, tabs vs. spaces, single vs. double quotes, trailing commas. | Found 15 files with inconsistent 2-space vs 4-space indents and mixed quotes, and normalizes them automatically. |

### Commands to use & how to present live in class:

1. **Check for lint errors (read-only):**
   ```bash
   pnpm lint
   ```
   *What to show:* Shows ESLint scanning files and printing warnings/errors with line numbers (e.g. unused variable `term` in `evidence/script.js`).

2. **Automatically fix lint issues (where auto-fixable):**
   ```bash
   pnpm lint:fix
   ```
   *What to show:* ESLint automatically modifies the source files to fix auto-fixable rules (like `prefer-const`).

3. **Automatically format the entire codebase with Prettier:**
   ```bash
   pnpm format
   ```
   *What to show:* Prettier scans all JS, TS, HTML, and CSS files in `src/` and instantly rewrites them to match our formatting rules (2-space indents, single quotes, clean spacing). Run `git diff` afterwards to show the exact formatting cleanup it made live.

---

**Demo 4 Questions & Answers:**

1. **What's the difference between what a linter checks/fixes and what a formatter checks/fixes? Give one concrete finding from each tool on this codebase.**
   - *(See table above)*. Linters analyze AST (Abstract Syntax Tree) to catch semantic and logic bugs (e.g., unused variable `term` in `src/pages/evidence/script.js`). Formatters analyze syntax purely for visual consistency without caring about program logic (e.g., standardizing 2-space indentation and single quotes across all 15 source files).

2. **Why are `lint` and `lint:fix` two separate scripts instead of one script that always auto-fixes? When would you deliberately want the non-fixing version?**
   - **In CI/CD pipelines (Quality Gates):** CI must never automatically mutate code; it must verify that pushed code already meets quality standards. If CI auto-fixed files, the deployed build might differ from what was tested or committed by the developer.
   - **Risk of unintended logic changes:** Many lint rules require human judgment to fix properly (e.g., deleting an unused variable vs. actually using it in the intended logic). Auto-fixing blindly can mask real bugs.
   - **Code reviews / Pre-commit checks:** Developers often want to inspect warnings and errors without unexpectedly altering their working tree or staging area.

3. **What does `npm run lint` (or `pnpm lint`) actually do under the hood? Where does npm/pnpm look for the `lint` command, and would it work if your linter weren't installed as a project dependency (only globally on your machine)?**
   - **Under the hood:** `pnpm lint` reads `package.json`, finds the `"lint"` script (`eslint .`), temporarily prepends `./node_modules/.bin` to the environment's `PATH`, and executes the command in a subshell.
   - **Where it looks:** It looks in the local project's `./node_modules/.bin/eslint`.
   - **If only installed globally:** If ESLint were only installed globally, `pnpm lint` might fall back to the system PATH on your machine, but **it would fail in CI or on teammates' computers** who don't have it installed globally. Furthermore, different machines might have different global versions with conflicting plugins. Installing it locally as a `devDependency` guarantees that every developer and CI runner executes the exact same version and configuration.

***DEMO 5***

**TypeScript Setup & Configuration:**
- Installed `typescript` and configured [tsconfig.json](file:///c:/Users/mkrad/Desktop/FH%20Campus%20Wien/WebApp/awd/tsconfig.json) with deliberate strictness and bundler settings:
  - `"strict": true`: Enables all strict type-checking family options.
  - `"noImplicitAny": true`: Forbids undeclared fallback to `any`.
  - `"strictNullChecks": true`: Treats `null` and `undefined` as separate types to eliminate runtime "Cannot read properties of undefined".
  - `"noEmit": true`: Disables emitting JS files from `tsc` because Vite handles building/bundling.
  - `"allowJs": true` & `"checkJs": false`: Supports gradual migration from JavaScript to TypeScript without breaking existing JS modules.
  - Installed `typescript-eslint` so ESLint parses and lints TypeScript syntax without parsing errors.

**Modules Converted (Zero `any`):**
- **`src/formatters.ts`**: Pure functions for formatting dates and CSS badge classes (`formatDate`, `getStatusBadgeClass`, `getRelevanceBadgeClass`, `certaintyBadgeClass`). Strongly typed with union types and defensive null checks.
- **`src/lookup.ts`**: Search and filter utilities (`findEvidenceById`, `findPersonById`, `findLocationById`, `evidenceMentionsPerson`). Defines explicit interfaces (`EvidenceItem`, `IdentifiedEntity`).
- **`src/utils.ts`**: Re-exports all helpers so existing imports across components continue working without interruption.

**Wired Tooling & Build Scripts:**
- Updated `package.json`:
  - `"build": "tsc --noEmit && vite build"`: Enforces static type checking before running Vite production bundling. Any type error halts the build and fails CI.
  - `"typecheck": "tsc --noEmit"`: Dedicated fast script to run type checks on demand without building.

**Demo 5 Questions & Answers:**

1. **What does the `strict` option in `tsconfig.json` actually turn on? Name at least two individual checks bundled under it, and say whether you kept it on and why.**
   - `strict: true` is a master setting that turns on:
     - `noImplicitAny`: Raises errors whenever a variable or parameter lacks an explicit type and would otherwise default to `any`.
     - `strictNullChecks`: Makes types non-nullable by default; `null` and `undefined` must be handled explicitly (e.g. `string | null`).
     - `strictFunctionTypes`, `strictBindCallApply`, `noImplicitThis`, `alwaysStrict`, `useUnknownInCatchVariables`.
   - **We kept `strict: true` on.**
   - **Why:** The primary motivation for adopting TypeScript is eliminating runtime bugs. Keeping `strict` on prevents implicit `any` leaks and guarantees that `null` or `undefined` values are checked at compile time before property access, preventing the most common class of web runtime crashes.

2. **What is the difference between a compile-time type error and the runtime bugs you fixed in Exercise 1? Could TypeScript alone have caught any of those specific bugs? Why or why not?**
   - **Compile-time type error:** Found statically before execution by the compiler (`tsc`). Catches wrong argument types, missing object properties, or type mismatches.
   - **Runtime bug:** Occurs while the code is running in the browser due to flawed logic, unexpected state transitions, or unhandled asynchronous flows.
   - **Could TypeScript have caught Exercise 1 bugs?**
     - **Demo 4 (Missing `await` on `loadNoteAsync`): YES.** `loadNoteAsync` returns a `Promise<string>`. If you treat the result as a string or pass it to a string function, TypeScript fails compilation: `Type 'Promise<string>' is not assignable to type 'string'`.
     - **Demo 2 (Reference vs. Copy mutation with `.sort()`): NO.** Assigning an array variable and calling `.sort()` on it is 100% valid TypeScript (`EvidenceItem[]`). The compiler cannot know you intended an immutable copy rather than an in-place mutation.
     - **Demo 3 (Forgotten flag reset `evidenceViewLoading = false`): NO.** Forgetting to assign a boolean flag in a `.then()` callback is a pure omission of business logic; all types are sound.

3. **What does `any` do to TypeScript's checking for a value, and why did you avoid it in this first pass even though it would have been faster to just silence the errors with it?**
   - **What `any` does:** Completely turns off type checking for that value. TypeScript blindly permits any property access, function call, or reassignment on an `any` variable, effectively reverting that portion of the codebase back to untyped JavaScript. It also spreads contagiously ("viral `any`") to any downstream variable that consumes it.
   - **Why we avoided it:** Using `any` defeats the purpose of migrating to TypeScript. Avoiding `any` forced us to define explicit domain shapes (`IdentifiedEntity`, `EvidenceItem`, string literal unions) and properly handle optional/null values, providing true compile-time safety and reliable editor auto-completion.

***DEMO 6***

**Domain Data Modeling (`src/types.ts`):**
- Defined complete, strict interfaces for all investigation entities matching `data/*.json`:
  - `CaseData`: Strongly types the case overview metadata (`caseId`, `title`, `status`, `summary`, etc.).
  - `Person`: Represents suspects/witnesses (`id`, `name`, `role`, `speciality`, `responsibilities`, `statement`, `background`, `avatar`).
  - `Location`: Physical sites (`id`, `name`, `description`, `contains`).
  - `TimelineEvent`: Chronological events (`id`, `time`, `title`, `description`, `certainty`, `personIds`, `locationIds`, `evidenceIds`).
  - `Evidence`: Investigation evidence records (`id`, `type`, `title`, `timestamp`, `summary`, `content`, `personIds`, `locationIds`, `tags`, `status`, `relevance`).
  - String literal union types:
    - `TimelineCertainty = 'confirmed' | 'contradictory' | 'reported'`
    - `EvidenceStatus = 'unreviewed' | 'reviewed' | 'flagged'`
    - `EvidenceRelevance = 'unknown' | 'relevant' | 'irrelevant'`
  - `HypothesisDraft` & `AppState`: Global app state container typing state properties, filter objects, and view tracking.

**Type-Safe Data Loading (`src/dataLoader.ts`):**
- Created dedicated loader module replacing raw, untyped `fetch().then(res => res.json())` with strongly-typed async functions returning explicit promises:
  - `fetchCaseData(): Promise<CaseData>`
  - `fetchPeopleData(): Promise<Person[]>`
  - `fetchLocationsData(): Promise<Location[]>`
  - `fetchTimelineData(): Promise<TimelineEvent[]>`
  - `fetchEvidenceData(): Promise<Evidence[]>`
- Wired these functions into `src/app.js` (`loadCorePeopleAndLocations`, `loadEvidenceData`, `loadTimelineData`), guaranteeing type safety at the network ingestion boundary.

**Ambiguous / Inconsistent Field Case Study:**
- **The Ambiguous Field:** `personIds` in `public/data/evidence.json`.
- **The Inconsistency:**
  - In most evidence records (e.g., `E01`), `personIds` holds normalized kebab-case IDs: `["patch-vector"]`.
  - In record `E04`, `personIds` holds the human-readable display name instead: `["Nova Byte"]`.
  - Furthermore, `evidence.type` has inconsistent casing across items (`"test-report"` in `E01` vs `"Test-Report"` in `E03`).
- **How JavaScript got away with it:**
  - Plain JavaScript uses duck typing and performs no compile-time structure checks.
  - The runtime code in Exercise 1 worked around this silently by checking both ID and name dynamically:
    ```js
    ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1
    ```
    Because JavaScript treats all array elements as loose strings, it never forced the developer to decide whether `personIds` was an array of foreign keys (`PersonId[]`) or an array of arbitrary display names.
- **What TypeScript forced us to decide:**
  - If we had modeled `personIds` strictly as `type PersonId = 'patch-vector' | 'dr-elena-rostova' | ...`, the actual runtime JSON file would violate the contract because `"Nova Byte"` is not a valid ID.
  - We had to explicitly acknowledge this domain anomaly:
    1. We typed `personIds: string[]` on `Evidence` and documented the anomaly in `types.ts`.
    2. We preserved the dual-matching lookup helper in `src/lookup.ts` (`evidenceMentionsPerson`) with strict typing: `ev: Evidence | null | undefined, person: Person`.
    3. In a production enterprise app, TypeScript would force an architectural decision: either build a runtime data-cleansing transformation layer at fetch time (normalizing `"Nova Byte"` -> `"patch-vector"`), or fix the backend/database JSON generator so foreign keys are always consistent IDs.

---

**Demo 6 Questions & Answers:**

1. **Walk through the ambiguous field you picked: how did the JavaScript version get away without deciding on one shape, and what did TypeScript force you to commit to?**
   - **The Field:** `personIds` on `Evidence` items in `public/data/evidence.json`.
   - **How JS got away with it:** JavaScript has dynamic typing and no schema enforcement. An array can hold any arbitrary strings at runtime. The original code accommodated the inconsistency with a defensive boolean check (`indexOf(person.id) !== -1 || indexOf(person.name) !== -1`). Because JS doesn't validate data against a compile-time schema, the sloppy data model went unnoticed until search/filter anomalies occurred.
   - **What TypeScript forced us to commit to:** TypeScript demands an unambiguous type contract. We could not declare `personIds: EntityId[]` without the realization that the JSON contains non-ID display names. TypeScript forced us to choose: do we enforce a strict identifier union and fail/reject display names, or do we model it as `string[]` and handle entity resolution explicitly? We committed to modeling `personIds: string[]`, explicitly documenting the data inconsistency in `types.ts`, and typing the lookup function to safely resolve both IDs and names.

2. **Is there a data-shape problem in this app that TypeScript's static types *can't* catch on their own, because the actual bad data would only show up at runtime from a JSON file, not from your code? What would you need in addition to types to catch that?**
   - **What TypeScript can't catch:** TypeScript only checks code at **compile time**. Once compiled to JavaScript, all type annotations are **completely erased**. When `fetch('/data/evidence.json')` executes in the user's browser, TypeScript cannot prevent or detect if:
     - The JSON file is missing required fields (e.g. `evidence.id` is omitted).
     - A field has the wrong type (e.g., `timestamp` is a number instead of a string, or `personIds` is `null` instead of an array).
     - New unexpected values break union types (e.g., `status: "archived"` instead of `'unreviewed' | 'reviewed' | 'flagged'`).
   - If bad data arrives from the network or a JSON file, TypeScript's static cast `(await res.json()) as Evidence[]` silently succeeds at runtime, and the app crashes later with `TypeError: Cannot read properties of undefined`.
   - **What is needed in addition to types:** A **runtime schema validation library** (such as **Zod**, **Valibot**, or **Yup**) or custom **TypeScript Type Guards** (`function isEvidence(obj: unknown): obj is Evidence`). With Zod, for example:
     ```ts
     const EvidenceSchema = z.object({
       id: z.string(),
       title: z.string(),
       status: z.enum(['unreviewed', 'reviewed', 'flagged']),
       personIds: z.array(z.string()),
     });
     const evidenceList = EvidenceSchema.array().parse(await res.json());
     ```
     This validates the actual incoming payload at runtime at the application boundary, throwing a clear error immediately if the JSON shape is malformed.

3. **What's the difference between an `interface` and a `type` alias for an object shape in TypeScript? Which did you use for your domain models, and does it actually matter here?**
   - **Differences between `interface` and `type`:**
     - **Declaration Merging:** An `interface` can be defined multiple times in the same scope, and TypeScript automatically merges the definitions into one (useful for extending third-party library types or Window/DOM definitions). A `type` alias cannot be redeclared; duplicate `type` names result in a compile error.
     - **Extensibility & Inheritance:** Interfaces extend via `interface A extends B { ... }`, which creates clean inheritance hierarchies and better compiler caching. Type aliases combine shapes via intersection: `type A = B & { ... }`.
     - **Supported Constructs:** `type` aliases can represent primitives, union types, intersection types, and tuples (e.g. `type Status = 'reviewed' | 'flagged'`, `type ID = string | number`). An `interface` can only describe object shapes or function signatures.
   - **Which did we use for domain models:**
     - We used **`interface`** for domain entity models (`CaseData`, `Person`, `Location`, `TimelineEvent`, `Evidence`, `AppState`).
     - We used **`type`** for union types and literal enums (`TimelineCertainty`, `EvidenceStatus`, `EvidenceRelevance`).
   - **Does it actually matter here?**
     - For the core object shapes themselves (`Person`, `Location`, etc.), **it does not practically matter** for static analysis: both compile away completely to 0 bytes of JavaScript, and both provide identical property type checking and editor autocompletion.
     - However, separating them follows TypeScript idiomatic best practices: use `interface` for extensible object contracts and data records, and use `type` for unions and primitives.

***DEMO 7***

**Full TypeScript Migration Completed (Zero `any`):**
- Converted 100% of remaining application modules from `.js` to `.ts`:
  - `src/state.ts`: Central reactive store strongly typed with `AppState`, strict storage deserialization with `unknown`, and safe type narrowing.
  - `src/app.ts`: Dynamic router registry (`Record<string, RouteEntry>`), global `window.navigateTo` typing, and null-safe view lifecycle handling.
  - `src/pages/dashboard/script.ts`: Typed metrics calculation, progress percentage rounding, and null-guarded container rendering.
  - `src/pages/people_locations/script.ts`: Strict tab union (`'people' | 'locations'`), typed entity lookups, and event target attribute retrieval.
  - `src/pages/timeline/script.ts`: Strict timeline event filtering, chronological sorting with explicit `.getTime()` milliseconds, and modal lifecycle typing.
  - `src/pages/workspace/script.ts`: Typed hypothesis draft forms, confidence range slider synchronization, and local storage persistence.
  - `src/pages/evidence/script.ts`: Multi-criteria search and filter engine, union type-safe status/relevance updates, note autosave, and bookmark state toggles.
  - `src/vite-env.d.ts`: Configured `/// <reference types="vite/client" />` so TypeScript recognizes Vite-specific `?raw` HTML import specifiers.

---

### Real Spots Flagged by Compiler: Latent Bug vs. Compiler Pedantry

| # | What the compiler flagged | Code Location | Real Latent Bug or Pedantry? | Explanation & Resolution |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Subtracting `Date` objects directly (`new Date(a.time) - new Date(b.time)`)** | `timeline/script.ts`, `evidence/script.ts` | **REAL LATENT BUG** | In JS, subtracting Date objects relies on implicit coercion via `.valueOf()`. If any timestamp string is corrupted or invalid, `new Date()` produces `Invalid Date` whose subtraction yields `NaN`. In JS array sorting, `NaN` comparisons silently fail, corrupting sort order. TypeScript flagged TS2362 (`arithmetic operation must be number/bigint`), forcing us to call `.getTime()`, making timestamp math explicit and safe. |
| **2** | **Direct `.value` property access on generic `HTMLElement`** | `timeline/script.ts`, `workspace/script.ts`, `evidence/script.ts` | **PEDANTRY / TYPE SOUNDNESS** | In HTML, generic `HTMLElement` does not have a `.value` property (only `HTMLInputElement`, `HTMLSelectElement`, etc. do). While `<select>` elements have `.value` at runtime, TypeScript statically cannot know the HTML tag of an arbitrary `getElementById` call. We resolved this with safe narrowing and type assertions (`as HTMLSelectElement \| null`). |
| **3** | **Unvalidated string assignment to strict union types** | `evidence/script.ts` (`ev.status = e.target.value`) | **REAL LATENT BUG** | In plain JS, any string or typo (`"reviewed"`, `"Reviewd"`, `"archived"`) could be assigned to `ev.status`. This would silently break CSS badge classes (`getStatusBadgeClass(ev.status)` returning empty) and filter matching. TypeScript flagged TS2322, forcing us to validate and cast: `target.value as EvidenceStatus`. |
| **4** | **Ad-hoc property mutation on domain objects (`ev.bookmarked`)** | `state.ts`, `workspace/script.ts`, `evidence/script.ts` | **REAL LATENT BUG** | Raw `evidence.json` does not have a `bookmarked` property; `applyStoredBookmarkFlags()` mutates evidence items at runtime. In plain JS, accessing `ev.bookmarked` before flags are applied returns `undefined`, which can cause erratic UI state. TypeScript flagged TS2339 (`Property 'bookmarked' does not exist on type 'Evidence'`), forcing us to explicitly declare `bookmarked?: boolean;` on `Evidence`. |
| **5** | **Null safety on DOM container lookups (`strictNullChecks`)** | `app.ts`, `dashboard/script.ts`, `people_locations/script.ts`, etc. | **REAL LATENT BUG** | `document.getElementById('app')` returns `HTMLElement \| null`. Under strict null checks, accessing `.innerHTML` directly raises TS2531 (`Object is possibly 'null'`). If an element ID was misspelled or queried before rendering, plain JS would crash the entire application with `TypeError: Cannot set properties of null`. TypeScript forced explicit guards (`if (!container) return;`). |

---

**Demo 7 Questions & Answers:**

1. **Show one specific type error you had to actually think about (not just silence with `any` or the `!` non-null assertion). What did it tell you about your code that plain JS review or testing hadn't?**
   - **The Error:** Subtracting `Date` instances in array sort callbacks (`new Date(a.time) - new Date(b.time)` in `timeline/script.ts` and `evidence/script.ts`).
   - **What it told us:** In JavaScript, developers frequently subtract `new Date()` objects because JS silently coerces them to epoch milliseconds via `.valueOf()`. However, TypeScript explicitly disallowed this with:
     `The left-hand side of an arithmetic operation must be of type 'any', 'number', 'bigint' or an enum type. (TS2362)`
     This forced us to inspect what happens if an unparseable timestamp or undefined field ever enters the array: subtracting yields `NaN`, which breaks the sort algorithm contract without throwing an exception, leading to silent, non-reproducible UI bugs. Using `.getTime()` explicitly converts the date to a verified `number`, ensuring mathematical and algorithmic correctness.

2. **When (if ever) is reaching for `any` the right call during a migration like this, versus a sign you should model the type properly? Where did you draw that line?**
   - **When `any` might be acceptable:**
     - Only as an emergency, temporary transitional bridge in massive legacy codebases where an un-typed third-party library has no `@types` definition available on DefinitelyTyped.
     - Even in that scenario, `unknown` combined with type narrowing/guards or a custom `.d.ts` ambient declaration is vastly superior to `any`.
   - **Where we drew the line:**
     - **We drew a hard line: ZERO `any` across our entire codebase.**
     - Reaching for `any` is a sign of bypassing the type system rather than modeling domain reality. For uncertain inputs (such as reading unvalidated JSON strings from `localStorage`), we used `unknown` and performed explicit runtime validation (`Array.isArray(parsed)`, `typeof parsed === 'object'`), and for DOM lookups, we used precise DOM element subtypes (`HTMLSelectElement`, `HTMLInputElement`).

3. **Did the migration reveal anything that was a genuine, previously-unnoticed bug (as opposed to just noise)? If yes, explain it. If no, explain how you're confident it was only noise.**
   - **Yes, it revealed genuine issues:**
     1. **Unused leftover variables:** ESLint and TypeScript caught `const term = ...` in `evidence/script.js` and `const id = ...` in `timeline/script.js` that were assigned but never used (vestiges of dead code from prior iterations).
     2. **Date arithmetic coercion risks:** Caught implicit object arithmetic in `.sort()` functions.
     3. **Unprotected DOM access:** Revealed multiple spots where DOM container queries were assumed to always succeed, which would crash with unhandled `TypeError` if an element ID changed in an HTML template.
     4. **Unmodeled property mutation:** Unveiled that `ev.bookmarked` was being mutated dynamically onto evidence objects without being part of any documented data contract.

***DEMO 8***

**GitHub Actions CI Workflow Setup (`.github/workflows/ci.yml`):**
- Configured continuous integration workflow triggered on `push` and `pull_request` to `main`:
  - **Runner:** `ubuntu-latest`
  - **Package Manager:** `pnpm@12.4.2` via `pnpm/action-setup@v4`
  - **Runtime:** `Node.js v22` with automatic pnpm store caching via `actions/setup-node@v4` (`cache: 'pnpm'`)
  - **Dependency Installation:** `pnpm install --frozen-lockfile` (ensures exact reproducibility from lockfile)
  - **Verification Steps:**
    - `pnpm typecheck` (`tsc --noEmit`) — static type verification
    - `pnpm lint` (`eslint .`) — AST code correctness checks
    - `pnpm format:check` (`prettier --check "src/**/*.{js,ts,css,html}"`) — visual code formatting enforcement

**Deliberate Failure & Recovery Demonstration:**
1. **Deliberate Failure (Commit `cb0793d` - *"lets test if the action fails"*):**
   - Introduced an unused variable in `src/app.ts`: `const deliberateError = 'broken';`.
   - Pushed to `origin/main`.
   - In the GitHub Actions tab, the `Development CI` workflow automatically triggered and **failed** with a red ❌ at the `Run linter` (`pnpm lint`) step with exit code 1 (`'deliberateError' is assigned a value but never used`).
2. **Recovery & Pass (Commit `e1d4c5a` - *"action failed sucessfully lets get back to normal"*):**
   - Removed/commented out the unused variable in `src/app.ts` and formatted the code.
   - Pushed to `origin/main`.
   - In the GitHub Actions tab, the workflow automatically triggered again, successfully ran `typecheck`, `lint`, and `format:check`, and turned **green ✔️** in ~35 seconds.
3. Both the failed run and the passing run are recorded in the repository's GitHub Actions run history at `https://github.com/kaschefi/awd/actions`.

---

**Demo 8 Questions & Answers:**

1. **What is the difference between a workflow, a job, and a step in GitHub Actions? Point to one of each in your workflow file.**
   - **Workflow:** The top-level automated pipeline configured in a YAML file in `.github/workflows/`. It defines the event triggers and the overall execution boundary.
     - *In our file:* `name: Development CI` (lines 1–7) triggered `on: push` and `on: pull_request`.
   - **Job:** A group of sequential steps executed inside an isolated virtual runner instance (e.g., an Ubuntu VM). Multiple jobs in a workflow execute in parallel by default unless dependency chains are defined with `needs:`.
     - *In our file:* `validate:` under `jobs:` (lines 9–12), running on `runs-on: ubuntu-latest`.
   - **Step:** An individual executable unit of work inside a job. A step can execute shell commands (`run:`) or execute a pre-packaged community action (`uses:`).
     - *In our file:* `- name: Run linter` running `run: pnpm lint` (line 33).

2. **Why should lint/format run in CI at all, if it already runs (or could run) on every developer's own machine before they push?**
   - **Bypassable local tools:** Developers can skip local Git hooks with `git commit --no-verify`, forget to run `pnpm lint`, or disable editor plugins.
   - **Environment discrepancies:** Local developer environments vary (different OS like Windows vs macOS vs Linux, differing Node.js versions, differing global package managers, or differing line-ending configurations `CRLF` vs `LF`).
   - **Authoritative Quality Gate:** CI serves as an impartial, standardized, clean-room arbiter. It guarantees that any code merged into `main` adheres to team quality standards, preventing "works on my machine" bugs and avoiding broken builds for teammates.

3. **What is dependency caching doing in your workflow, and what would happen (both correctness- and speed-wise) if you removed it?**
   - **What dependency caching does:**
     - In `actions/setup-node@v4` with `cache: 'pnpm'`, GitHub Actions calculates a hash of `pnpm-lock.yaml` and archives pnpm's global content-addressable store (`~/.local/share/pnpm/store`).
     - On subsequent workflow runs, if `pnpm-lock.yaml` hasn't changed, the store is restored from GitHub's cache archive instead of downloading every package tarball over the public internet from registry.npmjs.org.
   - **Speed-wise:**
     - Without caching: Every CI run must perform network requests to download hundreds of package tarballs, adding 30–90+ seconds per run.
     - With caching: Package files are restored from the local cache in ~1–3 seconds, dramatically speeding up feedback loops.
   - **Correctness-wise:**
     - Removing caching would **not** affect correctness. `pnpm install --frozen-lockfile` guarantees that the exact package versions and integrity hashes in `pnpm-lock.yaml` are strictly installed either way. Caching is purely a performance optimization and does not alter the installed dependency tree.


