# Project ReMotion – Investigation Portal

Investigate the failure of an AI-assisted rehabilitation robot.

## About

Project ReMotion is a browser-based investigation platform built around a fictional incident.
During a pre-demonstration calibration test, the AI-assisted rehabilitation robot **ReMotion**
loaded the wrong calibration profile and triggered its emergency stop. This application lets an
investigator review the evidence, people, locations, and timeline surrounding the incident, and
build up a working hypothesis about what happened.

This repository contains an existing vanilla-JavaScript (no frameworks used) investigation application. The system is
functional but has accumulated technical debt and inconsistent implementation decisions. Your task
during the course will be to analyse, maintain, refactor, migrate, and extend it.

## Running the application

This application uses `fetch()` to load its case data from local JSON files, so it must be served
over HTTP — opening `index.html` directly from the filesystem (`file://`) will not work in most
browsers.

Any static file server will do. For example, from the project root:

```bash
# Python 3
python -m http.server 8080

# Node.js (no install required)
npx serve .

# VS Code
# Use the "Live Server" extension
```

Then open `http://localhost:8080` (or whatever port your server prints) in your browser.

## Development Backend Server (Exercise 6)

In Exercise 6, the application introduces a lightweight read-only Node.js/Express backend (`server/server.js`) to simulate real-world networking, delays, and HTTP error responses.

> **Note (Dev-Only):** This backend is strictly for local development and live classroom demonstrations. It is **not deployed** to GitHub Pages (which continues to host the static frontend bundle).

### Starting the Servers Locally

Run the backend and frontend in separate terminals:

```bash
# Terminal 1: Start the Express backend (Port 3001)
pnpm run server

# Terminal 2: Start the Vite React development server (Port 5173)
pnpm run dev
```

### Backend Endpoints & Simulation Parameters

- **GET `/api/case`**: Returns `case.json`
- **GET `/api/evidence`**: Returns `evidence.json`
- **GET `/api/people`**: Returns `people.json`
- **GET `/api/locations`**: Returns `locations.json`
- **GET `/api/timeline`**: Returns `timeline.json`

#### Live Simulation Query Parameters:
- `?delay=<ms>`: Artificially delays the response (e.g. `http://localhost:3001/api/evidence?delay=2500`).
- `?error=500` or `?error=true`: Simulates an HTTP 500 Internal Server Error.
- `?error=404`: Simulates an HTTP 404 Not Found response.
- `?empty=true`: Simulates an empty dataset (e.g. `[]`) for testing empty states.


## Features

- **Dashboard** — case summary and key statistics calculated from the loaded case data.
- **Evidence catalogue** — search, filter (by type, person, location, status, relevance), sort,
  bookmark, and open detailed evidence records.
- **People & Locations** — profile cards for the investigation team and the six key locations.
- **Timeline** — chronological view of case events with filtering and links to related evidence.
- **Investigator workspace** — bookmarked evidence, personal notes, and a hypothesis draft form.
  Workspace data is saved to your browser's local storage and will still be there when you reload
  the page.

## Browser requirements

A recent version of any evergreen desktop browser (Chrome, Firefox, Edge, Safari). JavaScript must
be enabled. The layout targets common desktop and tablet widths.

## Project status

This is an existing brownfield application, not a fresh scaffold. It works for everyday use, but
you should expect to find rough edges, inconsistent patterns, and a handful of bugs as you work
with it — that discovery process is part of the course.
