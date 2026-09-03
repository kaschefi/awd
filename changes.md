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
so i just moved the sorting inside the getFilteredEvidence function.
