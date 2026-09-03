import { state } from '../../state.js';

export function switchPeopleTab(tab) {
  state.currentPeopleTab = tab;
  const peoplePanel = document.getElementById("peoplePanel");
  const locationsPanel = document.getElementById("locationsPanel");
  const peopleTabBtn = document.getElementById("tabPeopleBtn");
  const locationsTabBtn = document.getElementById("tabLocationsBtn");

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    peopleTabBtn.classList.add("active");
    locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    peopleTabBtn.classList.remove("active");
    locationsTabBtn.classList.add("active");
  }
}

function countEvidenceForPerson(person) {
  let count = 0;
  for (let i = 0; i < state.allEvidence.length; i++) {
    const ev = state.allEvidence[i];
    if (ev.personIds && (ev.personIds.indexOf(person.id) !== -1 || ev.personIds.indexOf(person.name) !== -1)) {
      count++;
    }
  }
  return count;
}

export function renderPeople() {
  const container = document.getElementById("peoplePanel");
  if (!container) return;
  let html = "";
  for (let i = 0; i < state.allPeople.length; i++) {
    const person = state.allPeople[i];
    const avatarSrc = "../" + person.avatar.replace(/\.png$/i, ".webp"); // Adjust the path to the avatar image
    const count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html += '<img class="person-avatar" src="' + avatarSrc + '" alt="Portrait of ' + person.name + '">';
    html += "<div><h3>" + person.name + "</h3><div class=\"person-role\">" + person.role + "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (let r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html += '<div class="person-statement">&ldquo;' + person.statement + '&rdquo;</div>';
    html += "<p>" + count + " related evidence item" + (count === 1 ? "" : "s") + " &mdash; ";
    html += '<button type="button" class="evidence-count-link" data-person-id="' + person.id + '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  const links = container.querySelectorAll(".evidence-count-link");
  for (let l = 0; l < links.length; l++) {
    links[l].addEventListener("click", function (e) {
      const personId = e.target.getAttribute("data-person-id");
      window.location.hash = "evidence";
      setTimeout(function () {
        const filterEl = document.getElementById("filterPerson");
        if (filterEl) {
          filterEl.value = personId;
          filterEl.dispatchEvent(new Event("change"));
        }
      }, 50);
    });
  }
}

export function renderLocations() {
  const container = document.getElementById("locationsPanel");
  if (!container) return;

  let html = "";
  for (let i = 0; i < state.allLocations.length; i++) {
    const loc = state.allLocations[i];
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (let c = 0; c < loc.contains.length; c++) {
      html += "<li>" + loc.contains[c] + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}

export function init() {
  renderPeople();
  renderLocations();
  switchPeopleTab(state.currentPeopleTab || "people");

  document.getElementById("tabPeopleBtn").addEventListener("click", () => switchPeopleTab('people'));
  document.getElementById("tabLocationsBtn").addEventListener("click", () => switchPeopleTab('locations'));
}