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



















demo2: the refrence vs copy bug happens when we assign an array or object to another variable, for example : 
a = [1,2,3]
b = a 
any change that we apply on b will also happen for a in this case when we go to the evidence page and sort the evidence by newest, oldest, a-z or z-a the order of the evidence in the dashboard also changes which it shouldnt. but in order to really get that bug in the website you should first solve the demo 3 to even get to the evidence page, and then you see that sorting is not working, the problem is that handleSortChange() sorts state.filteredEvidence.
Then it calls renderEvidenceList().
But the very first thing renderEvidenceList() does is call getFilteredEvidence(), which re-filters and resets state.filteredEvidence from scratch without applying the sort The sort is completely wiped out before the HTML is generated, depending on how you fix this you may also fix the demo2 bug as well. which is what already expected in demo 5 description.

demo 3: Root cause was that the evidenceViewLoading is set to true on startup. renderEvidenceList() checks this flag first — if it's true, it shows the spinner and returns early, never rendering the list. The flag was supposed to be cleared to false inside the .then() callback of loadEvidenceData(), once the fetch resolved and the data was ready. But that line was simply missing.

demo 4: if you open the devtools console you can see First note preview: Promise 
{<fulfilled>: ''} this is happening because 
loadNoteAsync is asynchronous, it returns a Promise object (a wrapper), not the note string itself,
there is another bug which is only visible in the console logs, go to the timeline and click on one of the view buttons and see the console logs in devtools, you'll see modal opened, active close listeners: 1 then close it and click the same button multiple times, and then you see that the counter goes up, very time the modal opens, it registers an additional click event listener using addEventListener without ever removing previous ones. As a result, duplicate event listeners stack up and execute repeatedly on a single click."
. keep in mind that even after fixing this the counter goes up, because this log is artificiall and it just wanted to show us that there is a problem there he is making the counter++ no matter what.

demo 5: there are more than one problems here, but i just fixed the sort problem which it lead to fixing the demo 2 bug as well. 

