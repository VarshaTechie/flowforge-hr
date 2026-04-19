import { create } from 'zustand';
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react';
import { NODE_TYPES, DEFAULT_NODE_DATA } from '../types';
import { WORKFLOW_TEMPLATES } from '../constants/workflowTemplates';

const STORAGE_KEY = 'flowforge-workflow-v1';
const MAX_HISTORY = 75;

let nodeIdCounter = 1;
const generateId = () => `node_${Date.now()}_${nodeIdCounter++}`;

const baseEdgeStyle = {
  animated: true,
  style: { stroke: '#6366f1', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed', color: '#6366f1' },
};

const isBrowser = typeof window !== 'undefined';

const createSnapshot = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  selectedNodeId: state.selectedNodeId,
});

const isSameSnapshot = (a, b) =>
  JSON.stringify(a.nodes) === JSON.stringify(b.nodes) &&
  JSON.stringify(a.edges) === JSON.stringify(b.edges) &&
  a.selectedNodeId === b.selectedNodeId;

const normalizeWorkflowPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return null;
  const nodes = Array.isArray(payload.nodes) ? payload.nodes : null;
  const edges = Array.isArray(payload.edges) ? payload.edges : null;
  if (!nodes || !edges) return null;
  return {
    nodes,
    edges,
    selectedNodeId:
      typeof payload.selectedNodeId === 'string' ? payload.selectedNodeId : null,
    theme: payload.theme === 'light' ? 'light' : 'dark',
  };
};

const readPersistedState = () => {
  if (!isBrowser) {
    return { nodes: [], edges: [], selectedNodeId: null, theme: 'dark' };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { nodes: [], edges: [], selectedNodeId: null, theme: 'dark' };
    const parsed = normalizeWorkflowPayload(JSON.parse(raw));
    if (!parsed) return { nodes: [], edges: [], selectedNodeId: null, theme: 'dark' };
    return parsed;
  } catch {
    return { nodes: [], edges: [], selectedNodeId: null, theme: 'dark' };
  }
};

const useWorkflowStore = create((set, get) => {
  const persisted = readPersistedState();

  const persistCurrentState = () => {
    if (!isBrowser) return;
    const state = get();
    const payload = {
      nodes: state.nodes,
      edges: state.edges,
      selectedNodeId: state.selectedNodeId,
      theme: state.theme,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  };

  const commit = (updater, options = { trackHistory: true }) => {
    const prevState = get();
    const prevSnapshot = createSnapshot(prevState);
    const patch = updater(prevState);

    if (!patch || typeof patch !== 'object') return false;

    const candidateState = { ...prevState, ...patch };
    const nextSnapshot = createSnapshot(candidateState);
    const hasWorkflowChange = !isSameSnapshot(prevSnapshot, nextSnapshot);

    if (hasWorkflowChange && options.trackHistory) {
      const past = [...prevState.historyPast, prevSnapshot].slice(-MAX_HISTORY);
      set({
        ...patch,
        historyPast: past,
        historyFuture: [],
      });
    } else {
      set(patch);
    }

    persistCurrentState();
    return true;
  };

  const replaceWorkflow = (payload, trackHistory = true) => {
    const normalized = normalizeWorkflowPayload(payload);
    if (!normalized) return false;
    return commit(
      () => ({
        nodes: normalized.nodes,
        edges: normalized.edges,
        selectedNodeId: normalized.selectedNodeId,
        theme: normalized.theme,
      }),
      { trackHistory }
    );
  };

  return {
    nodes: persisted.nodes,
    edges: persisted.edges,
    selectedNodeId: persisted.selectedNodeId,
    theme: persisted.theme,
    historyPast: [],
    historyFuture: [],

    getSelectedNode: () => {
      const { nodes, selectedNodeId } = get();
      return nodes.find((n) => n.id === selectedNodeId) || null;
    },

    canUndo: () => get().historyPast.length > 0,
    canRedo: () => get().historyFuture.length > 0,

    undo: () => {
      const state = get();
      if (state.historyPast.length === 0) return;

      const previous = state.historyPast[state.historyPast.length - 1];
      const current = createSnapshot(state);

      set({
        nodes: previous.nodes,
        edges: previous.edges,
        selectedNodeId: previous.selectedNodeId,
        historyPast: state.historyPast.slice(0, -1),
        historyFuture: [current, ...state.historyFuture].slice(0, MAX_HISTORY),
      });
      persistCurrentState();
    },

    redo: () => {
      const state = get();
      if (state.historyFuture.length === 0) return;

      const [next, ...restFuture] = state.historyFuture;
      const current = createSnapshot(state);

      set({
        nodes: next.nodes,
        edges: next.edges,
        selectedNodeId: next.selectedNodeId,
        historyPast: [...state.historyPast, current].slice(-MAX_HISTORY),
        historyFuture: restFuture,
      });
      persistCurrentState();
    },

    saveToLocalStorage: () => {
      persistCurrentState();
      return { ok: true };
    },

    loadFromLocalStorage: () => {
      if (!isBrowser) return { ok: false, error: 'localStorage is unavailable.' };
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return { ok: false, error: 'No saved workflow found.' };
        const parsed = normalizeWorkflowPayload(JSON.parse(raw));
        if (!parsed) return { ok: false, error: 'Saved workflow is invalid.' };
        replaceWorkflow(parsed, true);
        return { ok: true };
      } catch {
        return { ok: false, error: 'Failed to load saved workflow.' };
      }
    },

    importWorkflowFromJSON: (jsonText) => {
      try {
        const parsed = normalizeWorkflowPayload(JSON.parse(jsonText));
        if (!parsed) {
          return { ok: false, error: 'Invalid JSON. Expected { nodes: [], edges: [] }.' };
        }
        replaceWorkflow(parsed, true);
        return { ok: true };
      } catch {
        return { ok: false, error: 'JSON parsing failed.' };
      }
    },

    applyTemplate: (templateId) => {
      const template = WORKFLOW_TEMPLATES.find((item) => item.id === templateId);
      if (!template) return { ok: false, error: 'Template not found.' };
      const workflow = template.build();
      replaceWorkflow({ ...workflow, selectedNodeId: null, theme: get().theme }, true);
      return { ok: true };
    },

    setTheme: (theme) => {
      const nextTheme = theme === 'light' ? 'light' : 'dark';
      commit((state) => ({ theme: nextTheme || state.theme }), { trackHistory: false });
    },

    toggleTheme: () => {
      const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
      commit(() => ({ theme: nextTheme }), { trackHistory: false });
    },

    onNodesChange: (changes) => {
      const onlySelectionChanges =
        Array.isArray(changes) &&
        changes.length > 0 &&
        changes.every((change) => change.type === 'select');
      commit((state) => ({
        nodes: applyNodeChanges(changes, state.nodes),
      }), { trackHistory: !onlySelectionChanges });
    },

    onEdgesChange: (changes) => {
      const onlySelectionChanges =
        Array.isArray(changes) &&
        changes.length > 0 &&
        changes.every((change) => change.type === 'select');
      commit((state) => ({
        edges: applyEdgeChanges(changes, state.edges),
      }), { trackHistory: !onlySelectionChanges });
    },

    onConnect: (connection) => {
      const { nodes, edges } = get();
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (sourceNode?.type === NODE_TYPES.END) return;
      if (targetNode?.type === NODE_TYPES.START) return;

      const isDuplicate = edges.some(
        (edge) =>
          edge.source === connection.source &&
          edge.target === connection.target &&
          edge.sourceHandle === connection.sourceHandle
      );
      if (isDuplicate) return;

      // Keep paths simple in this prototype: one outgoing edge per node.
      const sourceAlreadyConnected = edges.some((edge) => edge.source === connection.source);
      if (sourceAlreadyConnected) return;

      // Prevent cross-path merges by allowing one incoming edge per node (except End).
      const targetAlreadyConnected =
        targetNode?.type !== NODE_TYPES.END &&
        edges.some((edge) => edge.target === connection.target);
      if (targetAlreadyConnected) return;

      commit((state) => ({
        edges: addEdge(
          {
            ...connection,
            ...baseEdgeStyle,
          },
          state.edges
        ),
      }));
    },

    addNode: (type, position) => {
      const { nodes } = get();
      if (type === NODE_TYPES.START && nodes.some((n) => n.type === NODE_TYPES.START)) {
        return { error: 'Only one Start node is allowed per workflow.' };
      }

      const id = generateId();
      const newNode = {
        id,
        type,
        position,
        data: { ...DEFAULT_NODE_DATA[type] },
      };

      commit((state) => ({ nodes: [...state.nodes, newNode] }));
      return { id };
    },

    deleteNode: (nodeId) => {
      commit((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
      }));
    },

    deleteEdge: (edgeId) => {
      commit((state) => ({
        edges: state.edges.filter((edge) => edge.id !== edgeId),
      }));
    },

    selectNode: (nodeId) => {
      commit(() => ({ selectedNodeId: nodeId }), { trackHistory: false });
    },

    clearSelection: () => {
      commit(() => ({ selectedNodeId: null }), { trackHistory: false });
    },

    updateNodeData: (nodeId, data) => {
      commit((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
        ),
      }));
    },

    clearWorkflow: () => {
      commit(() => ({ nodes: [], edges: [], selectedNodeId: null }));
    },

    getWorkflowJSON: () => {
      const { nodes, edges, selectedNodeId, theme } = get();
      return { nodes, edges, selectedNodeId, theme };
    },

    validateWorkflow: () => {
      const { nodes, edges } = get();
      const errors = [];

      if (nodes.length === 0) {
        errors.push('Workflow is empty. Add at least a Start and End node.');
        return errors;
      }

      const startNodes = nodes.filter((node) => node.type === NODE_TYPES.START);
      if (startNodes.length === 0) errors.push('Workflow must have a Start node.');
      if (startNodes.length > 1) errors.push('Only one Start node is allowed.');

      const endNodes = nodes.filter((node) => node.type === NODE_TYPES.END);
      if (endNodes.length === 0) errors.push('Workflow must have an End node.');

      nodes.forEach((node) => {
        const incomingCount = edges.filter((edge) => edge.target === node.id).length;
        const outgoingCount = edges.filter((edge) => edge.source === node.id).length;
        const hasIncoming = incomingCount > 0;
        const hasOutgoing = outgoingCount > 0;

        if (node.type === NODE_TYPES.START && hasIncoming) {
          errors.push('Start node must not have incoming connections.');
        }
        if (node.type === NODE_TYPES.END && hasOutgoing) {
          errors.push('End node must not have outgoing connections.');
        }
        if (
          node.type !== NODE_TYPES.START &&
          node.type !== NODE_TYPES.END &&
          !hasIncoming
        ) {
          errors.push(`Node "${node.data?.title || node.id}" has no incoming connection.`);
        }
        if (node.type !== NODE_TYPES.END && !hasOutgoing) {
          errors.push(`Node "${node.data?.title || node.id}" has no outgoing connection.`);
        }
        if (outgoingCount > 1) {
          errors.push(
            `Node "${node.data?.title || node.id}" has multiple outgoing connections. Cross paths are disabled in this prototype.`
          );
        }
        if (node.type !== NODE_TYPES.END && incomingCount > 1) {
          errors.push(
            `Node "${node.data?.title || node.id}" has multiple incoming connections. Cross paths are disabled in this prototype.`
          );
        }
      });

      const adjacency = {};
      edges.forEach(({ source, target }) => {
        if (!adjacency[source]) adjacency[source] = [];
        adjacency[source].push(target);
      });

      const WHITE = 0;
      const GRAY = 1;
      const BLACK = 2;
      const color = {};
      nodes.forEach((node) => {
        color[node.id] = WHITE;
      });

      const dfs = (nodeId) => {
        color[nodeId] = GRAY;
        for (const neighbor of adjacency[nodeId] || []) {
          if (color[neighbor] === GRAY) return true;
          if (color[neighbor] === WHITE && dfs(neighbor)) return true;
        }
        color[nodeId] = BLACK;
        return false;
      };

      for (const node of nodes) {
        if (color[node.id] === WHITE && dfs(node.id)) {
          errors.push('Workflow contains a cycle. Cycles are not allowed.');
          break;
        }
      }

      return errors;
    },
  };
});

export default useWorkflowStore;
