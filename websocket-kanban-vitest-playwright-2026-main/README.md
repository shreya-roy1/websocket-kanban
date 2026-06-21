# 📝 Real-Time Collaborative Kanban Board

A premium, production-ready **Real-Time Kanban Board** built using **React (Vite)**, **Node.js (Express + Socket.IO)**, **Tailwind CSS**, and **Recharts**. This project enables real-time task creation, editing, category/priority updates, and drag-and-drop column movement with live analytics synchronization across all connected clients.

---

## 🚀 Key Features

*   **Real-time Collaboration**: Live WebSockets (Socket.IO) integration synchronizes board states across all clients instantly.
*   **Interactive Drag & Drop**: Move tasks between columns (*To Do*, *In Progress*, *Done*) with fluid visual indicators and hover effects.
*   **Task Customization**: Categorize tasks (*Bug*, *Feature*, *Enhancement*) and assign priority levels (*Low*, *Medium*, *High*) using high-fidelity dropdown selectors.
*   **File Attachments**: Upload attachments with validation (images & PDFs) and render live previews (image previews / file tags).
*   **Live Analytics Dashboard**: Recharts-powered distribution bar chart and completed-percentage gauge that recalculate dynamically as tasks are updated or moved.
*   **Adaptive Glassmorphism Theme**: Visual slate-dark theme styling with micro-animations and glowing accent borders.
*   **Resilient Socket Indicator**: Displays connection status ("Live" / "Offline") with color-coded tags.

---

## 📂 Project Structure

```
websocket-kanban-vitest-playwright/
│── backend/                     # Node.js Express server
│   ├── server.js                 # WebSocket event broadcasts
│   ├── package.json              # Backend script & packages
│
│── frontend/                     # React App (Vite)
│   ├── src/
│   │   ├── components/           # KanbanBoard, TaskCard, TaskModal, StatsChart
│   │   ├── hooks/                # useSocket hook
│   │   ├── tests/
│   │   │   ├── unit/             # Unit tests (Vitest)
│   │   │   ├── integration/      # Integration tests (mocked socket)
│   │   │   ├── e2e/              # E2E tests (Playwright)
│   │   ├── App.jsx               # Main layout container
│   │   ├── index.css             # Tailwind base & glassmorphism utilities
│   │   └── main.jsx              # Entry point
│   ├── package.json
│
└── package.json                  # Root developer dependency runner
```

---

## ⚡ Setup & Local Run Instructions

### 1. Run Everything (Concurrent Development Mode)
From the root workspace directory, run:
```bash
npm run dev
```
This single command concurrently starts:
*   The **Backend Server** on [http://localhost:3001](http://localhost:3001)
*   The **Frontend App** on [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing Guide

We have implemented exhaustive testing suites covering unit rendering, event-based socket integration, and complete browser E2E workflows.

### 1. Unit & Integration Tests (Vitest + React Testing Library)
Run the following from the root directory to run unit and integration assertions:
```bash
npm run test
```
*   **Unit Tests** (`KanbanBoard.test.jsx`): Verify components render headers, columns, priority tags, categories, modals, and task actions.
*   **Integration Tests** (`WebSocketIntegration.test.jsx`): Mock the websocket client to assert DOM state shifts on receiving server messages.

### 2. End-to-End Tests (Playwright)
Run the E2E suite against the active development server:
```bash
npm run test:e2e
```
*   **E2E Tests** (`KanbanBoard.e2e.test.js`): Simulate user flows in headless browsers, verifying task additions/updates/deletions, drag-and-drop status moves, attachment uploading, validation error banners, and chart updates.

---

## 🛡️ Architecture & Design Decisions

1.  **HTML5 Drag & Drop**: Standardized, zero-dependency browser API utilized to ensure React 19 compatibility and maximum package efficiency.
2.  **CSS-First Configuration**: Built on Tailwind CSS v4 to utilize fast compiling and styling within `index.css`.
3.  **In-Memory Store**: Managed as a centralized tasks array in `server.js` allowing immediate local evaluation by developers without needing database setups.
