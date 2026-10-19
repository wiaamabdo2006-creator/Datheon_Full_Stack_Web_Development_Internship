# Datheon Full Stack Web Development Internship

This repository contains the projects I completed during the Full Stack Web Development Internship at Datheon. Each project lives in its own folder, is built with plain HTML, CSS and JavaScript, and runs in the browser with no build step.

## Projects

| Project | Description | Technologies |
| --- | --- | --- |
| [Portfolio](./Portfolio) | A responsive personal portfolio website presenting my background as a Computer Science student, my skills and my work. | HTML, CSS |
| [CRUD](./CRUD) | **Taskboard**, a task manager with full create, read, update and delete operations, categories, due dates, status filters, search, drag-and-drop reordering and light and dark themes. Tasks are saved in the browser. | HTML, CSS, JavaScript (ES6+), localStorage |
| [Weather](./Weather) | **Skycast**, a live weather dashboard. Search any city worldwide to see current conditions and a 5-day forecast. | HTML, CSS, JavaScript (ES6+), Fetch API, async/await |

## Skycast: Live Weather Dashboard

**Features**
- Search for any city, with live suggestions as you type
- Current temperature, condition, humidity, wind speed and direction, pressure, UV index, chance of rain, sunrise and sunset
- Dynamic weather icons that change between day and night
- Background gradient that changes with the weather (clear, cloudy, rain, storm, snow, fog) and with day or night
- Hourly forecast for the next 24 hours and a 5-day forecast with temperature range bars
- Loading spinner, plus clear messages for invalid cities, being offline and service errors, with a retry button
- Temperature unit toggle (°C and °F), recent searches and "My location" support
- Responsive layout for desktop and mobile

**Data source.** Weather data comes from the free [Open-Meteo](https://open-meteo.com/) API. It needs no API key, so no secret is stored in this public repository.

## Folder Structure

```
Datheon_Full_Stack_Web_Development_Internship/
├── Portfolio/
│   ├── index.html
│   └── README.md
├── CRUD/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── README.md
├── Weather/
│   ├── index.html
│   ├── styles.css
│   └── app.js
└── README.md
```

## How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/wiaamabdo2006-creator/Datheon_Full_Stack_Web_Development_Internship.git
   ```
2. Open the `index.html` file of any project in a modern browser:
   - `Portfolio/index.html`
   - `CRUD/index.html`
   - `Weather/index.html`

The Weather project needs an internet connection to load live data.

## What I Learned

- Structuring projects with separate HTML, CSS and JavaScript files
- Managing application state and manipulating the DOM with vanilla JavaScript
- Persisting data with the localStorage API
- Calling REST APIs with `fetch()` and `async/await`, and handling loading and error states
- Building responsive, accessible interfaces with CSS Grid and Flexbox
- Using Git and GitHub to organise and publish my work

## Author

**Wiaam Hassan Abdo**, Computer Science student
GitHub: [wiaamabdo2006-creator](https://github.com/wiaamabdo2006-creator)