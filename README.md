# FlowForge HR: Workflow Designer Prototype

Mini HR Workflow Designer built with React + React Flow for designing and testing onboarding, leave approval, and document workflows.

## 1. Run the Project

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## 2. Scope Coverage Against Assignment

- React app using Vite.
- React Flow canvas with custom nodes:
  - Start
  - Task
  - Approval
  - Automated Step
  - End
- Drag nodes from sidebar, connect edges, select/edit node, delete nodes/edges.
- Node inspector with dedicated form per node type.
- Mock API layer:
  - `GET /automations` via `getAutomations()`
  - `POST /simulate` via `simulateWorkflow(workflowJson)`
- Workflow sandbox:
  - Serializes current graph
  - Runs simulation against mock API
  - Renders step-by-step execution log
  - Runs structural validation before simulate (missing links, cycle detection, Start/End constraints)

## 3. Architecture

```text
src/
  api/
    mockApi.js
  components/
    canvas/
    inspector/
    nodes/
    sandbox/
    sidebar/
    topbar/
  constants/
    workflowTemplates.js
  hooks/
    useAutomations.js
    useHistoryShortcuts.js
    useThemeSync.js
  store/
    workflowStore.js
  types/
    index.js
    workflow.types.js
```

### Key Design Choices

- `workflowStore` (Zustand) is the single source of truth for nodes, edges, selection, validation, and history.
- Canvas logic, forms, API logic, and simulation UI are separated by feature folders.
- Node forms use controlled form state through `react-hook-form`.
- Automated Step form parameters are rendered dynamically from automation metadata.
- Reusable hooks handle cross-cutting concerns:
  - `useAutomations`
  - `useHistoryShortcuts`
  - `useThemeSync`

## 4. Node Configuration

- Start Node
  - Start title
  - Optional metadata key-value pairs
- Task Node
  - Title (required)
  - Description
  - Assignee
  - Due date
  - Optional custom key-value fields
- Approval Node
  - Title
  - Approver role (`Manager`, `HRBP`, `Director`)
  - Auto-approve threshold (number)
- Automated Step Node
  - Title
  - Action (`send_email`, `generate_doc`)
  - Dynamic action parameters from mock API definition
- End Node
  - End message
  - Summary flag (boolean)

## 5. Validation Rules

Implemented in `validateWorkflow()`:

- At least one Start and one End node exist
- Start has no incoming edges
- End has no outgoing edges
- Non-terminal nodes are connected
- No cycles in graph (DFS coloring)

## 6. Type Safety Notes

- Workflow interfaces are explicitly documented in `src/types/workflow.types.js`:
  - Node kinds
  - Node data contracts
  - Edge contract
  - Serialized workflow shape
- Shared workflow constants are centralized in `src/types/index.js`.

## 7. Assumptions

- Prototype is front-end only (no auth/backend persistence).
- Mock API simulates network latency and execution responses.
- Approval flow is a single linear path (no branching cross-path logic in this version).

