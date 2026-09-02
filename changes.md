***DEMO 1***

well in demo 1, i created a src file first, then created a page folder and in that one each page got its own folder,in that    folder there is an index.html and script.js for each of the pages, i also though it would make sense to seperate the state and utils from the app so that the app would only load data and also act as the router, i could also seperate this two in two files   but since we only have 5 pages, but for scaleability i could seperate them too 

***DEMO 2***

i dont know if this bug was a thing before the seperation or not but in the evidence i cant sort by timeline in dev tool i got this **error : VM169 index.html:1 Uncaught ReferenceError: handleSortChange is not defined at HTMLSelectElement.onchange (VM169 index.html:1:1)** after some investigation i found out that By default, evidence.json was ordered such that the initial view either didn't trip over a missing tags property immediately or rendered cards before hitting one.As soon as i sort by Title (A–Z) or Title (Z–A), an evidence record with no tags property gets moved up into the rendering loop. ev.tags.indexOf(...) throws an unhandled TypeError