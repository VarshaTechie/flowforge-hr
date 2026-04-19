# FlowForge HR - Visual Workflow Designer

[![Live Demo](https://img.shields.io/badge/Live-Demo-green?style=for-the-badge&logo=vercel)](https://flowforge-hr.vercel.app/)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)
![Zustand](https://img.shields.io/badge/Zustand-5.0-orange?logo=react)
![Theme](https://img.shields.io/badge/Theme-Dark%2FLight-success)
![Validation](https://img.shields.io/badge/Validation-DAG-red)

---

## 🔗 Live Demo

👉 https://flowforge-hr.vercel.app/

> Try switching between **Dark and Light mode** from the UI

---


FlowForge HR is a production-grade, modular, and interactive visual builder designed for HR administrators to design, configure, and simulate complex workflows such as employee onboarding, approval processes, and automated notifications.

Built with performance and scalability in mind, it provides a seamless 3-column UI experience inspired by modern design tools.

---

## 📸 Visual Overview

<img width="1919" height="955" alt="image" src="https://github.com/user-attachments/assets/1f2dbe67-8473-4267-849a-8e31268f26aa" />


### Key Interface Areas

| Feature | Description |
|--------|------------|
| **Theme Engine** | Toggle between Dark and Light modes using CSS variables |
| **Workflow Canvas** | Drag-and-drop workflow builder powered by React Flow |
| **Property Inspector** | Real-time node editing using dynamic forms |
| **Validation Engine** | Ensures DAG constraints (no cycles, valid flow) |
| **Sandbox Mode** | Simulates workflow execution step-by-step |*Sandbox Mode** | *Shot of the simulation modal running through a workflow trace.* |

---

## 🏗️ Architecture

FlowForge HR follows a modern, decoupled architecture centered around a central state container and a high-performance visual engine.

### Tech Stack
- **Framework**: [React 19](https://react.dev/) (Vite-powered for lightning-fast HMR)
- **Visual Engine**: [@xyflow/react](https://reactflow.dev/) (React Flow) for orchestrating the node-edge canvas.
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) for lightweight, high-performance global state (Workflow, History, Theme).
- **Forms**: [React Hook Form](https://react-hook-form.com/) for typed, high-performance property editing.
- **Styling**: Vanilla CSS with a customized Design System of CSS variables for instant theme switching.

### State Flow
1. **Zustand Store**: The "Source of Truth" holding the node/edge array and configuration data.
2. **React Flow**: Consumes the store to render the visual graph.
3. **Inspector**: Synchronizes bi-directionally with the store to allow real-time attribute editing.
4. **Validation Layer**: A custom utility within the store that performs Graph Traversal (DFS) to ensure logical integrity.

---

## 📂 Project Structure

```text
flowforge-hr/
├── public/              # Static assets (logos, icons)
├── src/
│   ├── api/             # Mock API simulation layer (simulates backend responses)
│   ├── components/
│   │   ├── canvas/      # The primary React Flow workspace wrapper
│   │   ├── inspector/   # Property Editor (The Right Column)
│   │   ├── nodes/       # Custom Node implementations (Task, Decision, etc.)
│   │   ├── sandbox/     # Workflow Simulation/Step-through engine
│   │   ├── sidebar/     # Drag-and-drop Node Library (The Left Column)
│   │   └── topbar/      # Global Actions (Undo/Redo, Theme, Export)
│   ├── constants/       # Configuration, default data, and Workflow Templates
│   ├── hooks/           # Custom React hooks (Keyboard shortcuts, Theme sync)
│   ├── store/           # Zustand store (workflowStore.js) - The brain of the app
│   ├── types/           # Core data structures and interface definitions
│   ├── App.jsx          # Root layout and component orchestration
│   ├── App.css          # Layout-specific styling
│   ├── index.css        # Global CSS variables, Dark Mode tokens, and Typography
│   └── main.jsx         # Application entry point
├── package.json         # Dependency manifest and scripts
└── README.md            # Implementation Documentation
```

---

## 🚀 How to Run

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd flowforge-hr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

> [!NOTE]
> Once started, the application will be available at: **[http://localhost:5173/](http://localhost:5173/)**


---

## 🎨 Design Decisions

### 1. The 3-Column "Designer" Pattern
FlowForge HR adopts the industry-standard "Sidebar - Canvas - Inspector" layout.
- **Left Sidebar**: Keeps the canvas clean by housing all "parts" elsewhere.
- **Central Canvas**: Focuses the user's attention on the workflow logic.
- **Right Inspector**: Provides focused, contextual editing without interrupting the flow logic.

### 2. Directed Acyclic Graph (DAG) Enforcement
HR workflows typically require a logical progression. To ensure this:
- **Cycle Detection**: The system implements a Depth-First Search (DFS) algorithm to detect and block infinite loops.
- **Connectivity Validation**: The engine checks that every node is reachable from "Start" and eventually leads to an "End".

### 3. Snapshot-Based Undo/Redo
Instead of complex command-pattern diffs, a Snapshot History is implemented in Zustand. This ensures that even complex property changes are perfectly restored without side effects. It is currently capped at **75 steps** to balance memory and capability.

### 4. CSS Variable Design System
To support Dark/Light mode efficiently, the entire UI is built on top of a "semantic" palette (e.g., `--bg-primary`, `--accent-indigo`). Switching themes is a simple data-attribute toggle on the root element.

---

## ⌨️ Keyboard Shortcuts

Power users can navigate the designer more efficiently with these built-in shortcuts:

| Action | Shortcut |
| :--- | :--- |
| **Undo** | `Ctrl` / `Cmd` + `Z` |
| **Redo** | `Ctrl` / `Cmd` + `Shift` + `Z` |
| **Delete Node/Edge** | `Backspace` / `Delete` |
| **Select All** | `Ctrl` / `Cmd` + `A` |

---

## 🧩 Node Library Reference

FlowForge HR provides a set of specialized nodes tailored for HR logic:

| Icon | Name | Description |
| :--- | :--- | :--- |
| ▶ | **Start** | The entry point of the workflow. Only one allowed per design. |
| ✓ | **Task** | Assigns a manual task (e.g., "Sign Contract") to an employee. |
| ✦ | **Approval** | Pauses the flow until a Manager or HRBP explicitly approves. |
| ⚡ | **Automated** | Triggers background actions like email notifications or system API calls. |
| ■ | **End** | Marks the completion of the workflow path. |

---

## 🛡️ Logical Validation Rules

The engine automatically validates your design against these rules to prevent runtime failures:

1. **Cycle Detection**: No infinite loops are allowed. The graph must be a Directed Acyclic Graph (DAG).
2. **Connectivity**: Every node must be reachable from the "Start" node.
3. **No Dead Ends**: Every path (except those leading to "End") must have a valid outgoing connection.
4. **Single Root**: Only one "Start" node can exist to ensure a clear entry point.

---

## ✅ Completed vs. 🛠️ Future Roadmap

### What's Completed
- [x] **Full Drag-and-Drop Canvas**: Build workflows from scratch using custom node types.
- [x] **Universal Validation**: Real-time checking for orphaned nodes, multiple starts, and logical cycles.
- [x] **Theme Engine**: Seamless toggle between Premium Dark Mode and crisp Light Mode.
- [x] **Template Engine**: One-click application of standard HR workflows (Onboarding, Performance Review).
- [x] **Local Persistence**: Workflows are automatically saved to `localStorage`.
- [x] **JSON Export/Import**: Download your workflow designs as portable files.
- [x] **Visual Polish**: Premium dark mode, micro-animations, and sleek typography.

### Future Roadmap (If given more time)
- [ ] **Backend Integration**: Replace `localStorage` with a robust SQL/NoSQL database and user authentication.
- [ ] **Collaboration Engine**: Real-time collaborative editing using WebSockets or CRDTs.
- [ ] **Version Control**: A "Save Version" feature to track workflow changes over time with a diff viewer.
- [ ] **Parallel Logic**: Support for "Join" and "Split" nodes to handle complex parallel approval paths.
- [ ] **Third-Party Integrations**: Direct integration nodes for Slack, Gmail, or Jira (using real OAuth).

---

**📄 License**

MIT
