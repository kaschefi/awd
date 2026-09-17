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
