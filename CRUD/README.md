# Taskboard: CRUD Task Manager

A lightweight, dependency-free productivity app for managing daily tasks. Built with vanilla HTML, CSS and JavaScript (ES6+), it supports full CRUD operations and saves everything in the browser, so your tasks are still there after a page reload.

Part of the **Datheon Python Internship** repository.

## Features

- **Create, read, update and delete tasks.** Edit a task's title, category or due date in place.
- **Categories.** Organise tasks as Work, Personal, Study or Other, each with a colour-coded badge.
- **Due dates.** Set a due date on any task. Overdue tasks are highlighted.
- **Completion tracking.** Mark tasks complete with an animated checkbox and strike-through. A progress bar shows overall completion.
- **Status filters.** Switch between All, Active and Completed, with live counts on each tab.
- **Category filter and search.** Narrow the list by category or find tasks with instant text search.
- **Drag-and-drop reordering.** Drag a task by its handle to change its position.
- **Persistent storage.** Tasks are saved to `localStorage` automatically.
- **Light and dark themes.** The theme follows your system preference and can be toggled manually. Your choice is remembered.
- **Responsive and accessible.** The layout works on desktop and mobile, with keyboard focus states and reduced-motion support.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Markup | HTML5 |
| Styling | CSS3 (custom properties, Grid, Flexbox, transitions) |
| Logic | JavaScript (ES6+) |
| Storage | Web Storage API (`localStorage`) |

No frameworks, build tools or external libraries are required.

## Project Structure

```
CRUD/
├── index.html   # Page structure
├── styles.css   # Styling, themes and animations
├── app.js       # State management, CRUD logic, persistence
└── README.md
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/wiaamabdo2006-creator/Datheon_Python_Internship.git
   ```
2. Open the project folder:
   ```bash
   cd Datheon_Python_Internship/CRUD
   ```
3. Open `index.html` in any modern browser. No server or installation is needed.

## Usage

| Action | How |
| --- | --- |
| Add a task | Type a title, choose a category and optional due date, then press **Add task** or Enter |
| Complete a task | Click the checkbox on the left of the task |
| Edit a task | Click **Edit**, change the fields, then **Save** (Enter) or **Cancel** (Esc) |
| Delete a task | Click **Delete** |
| Filter | Use the All, Active and Completed tabs or the category dropdown |
| Search | Type in the search box |
| Reorder | Drag the handle on the left of a task |
| Clear finished tasks | Click **Clear completed** |
| Change theme | Click the theme button in the header |

## How It Works

- **State.** All tasks live in a single `tasks` array. Each task is an object with `id`, `text`, `category`, `due` and `done`.
- **Rendering.** A single `render()` function rebuilds the list from the current state and active filters.
- **Persistence.** `saveToLocalStorage()` runs after every change, and `loadFromLocalStorage()` restores the data on startup. Both are wrapped in `try/catch`, so the app keeps working if storage is unavailable.
- **Security.** User input is escaped before being inserted into the page.

## Data Storage Notes

Data is stored in your browser under the key `taskboard.tasks.v1`. This means:

- Tasks are private to your browser and device and are not synced anywhere.
- Clearing your browser data or using private browsing will remove them.
- Opening the app in a different browser starts with an empty list.

## Browser Support

Works in the current versions of Chrome, Edge, Firefox and Safari. Drag-and-drop reordering uses the HTML5 Drag and Drop API, so it is available with a mouse but not on touch screens.

## Possible Improvements

- Touch-friendly reordering
- Task priorities and subtasks
- Recurring tasks and reminders
- Import and export of tasks as JSON
- Backend sync across devices

## License

This project was created for educational purposes as part of an internship programme. Add a license of your choice (for example MIT) if you plan to share or reuse it.