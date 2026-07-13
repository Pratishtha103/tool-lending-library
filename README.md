# Tool Lending Library Management System

An enterprise-ready, full-stack asset tracking and lending catalog system built to replace paper-based forms and Excel spreadsheets for floor staff and administrators.

---

## 🚀 Key Features

*   **Feature-Complete CRUD**: Add, read, update, checkout, checkin, and delete assets dynamically.
*   **JSON Persistence Layer**: Uses a server-side JSON file (`src/data/tools.json`) acting as a local database, maintaining state across restarts and browser reloads.
*   **XSS Input Sanitization**: Employs sanitization filters (`src/services/security.js`) to secure inputs against JavaScript script injection before database writes.
*   **Robust Form Validation**: Implements real-time inline checking. Required or malformed fields are marked in red with descriptive helper messages. Includes a custom safety deletion confirmation dialog.
*   **Connectivity Simulation**: Includes a network latency picker to test user experiences under high-latency/slow 3G conditions, rendering custom shimmer skeletons.
*   **Role-Based Authorization Switches**: Simulates roles for **Floor Staff** (viewing and check-in/out) and **Managers** (full CRUD and asset registration privileges).
*   **100% Accessible (a11y)**: Built with proper semantic HTML, ARIA tags, high-contrast outlines for keyboard focus (`:focus-visible`), and a custom focus trap modal (Tab wrap-around, Escape key listener).
*   **Monochromatic Design System**: Strict grayscale corporate styling parameters (8px/16px/24px/32px steps) in `src/app/globals.css`.

---

## 🛠️ Technology Stack

*   **Framework**: Next.js 16 (App Router)
*   **Language**: JavaScript / React 19 (Client Components)
*   **Styling**: Pure Vanilla CSS (Monochromatic tokens, dark/light theme support)
*   **Database**: File-based local JSON database
*   **Linter**: ESLint (Next Config)

---

## 💻 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) (v18+) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) inside your web browser to access the dashboard.

### 3. Production Compilation Build
```bash
npm run build
```

### 4. Code Quality Lint Checking
```bash
npm run lint
```

---

## 📂 Project Architecture

```
├── src
│   ├── app
│   │   ├── api
│   │   │   └── tools
│   │   │       └── route.js       # Express-like API endpoint handlers (GET, POST, PUT, DELETE)
│   │   ├── globals.css            # Grayscale CSS variables, resets, and layout rules
│   │   ├── layout.js              # Base layout and SEO Metadata configuration
│   │   └── page.js                # Core controller, state, modals, and notifications
│   ├── components
│   │   ├── Header.jsx             # Title bar, authorization switches, and latency simulators
│   │   ├── ToolFormModal.jsx      # Multi-mode validation forms with keyboard trap listeners
│   │   ├── ToolGrid.jsx           # Skeletons, cards, custom badges, and empty states
│   │   └── Toolbar.jsx            # Search bar and filters
│   ├── data
│   │   └── tools.json             # Seed database file
│   └── services
│       └── security.js            # Input protection escaping functions (XSS prevention)
```
