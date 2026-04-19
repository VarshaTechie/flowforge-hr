// Node type constants
export const NODE_TYPES = {
  START: 'startNode',
  TASK: 'taskNode',
  APPROVAL: 'approvalNode',
  AUTOMATED: 'automatedNode',
  END: 'endNode',
};

// Shared, explicit workflow configuration enums
export const APPROVER_ROLES = ['Manager', 'HRBP', 'Director'];

// Node palette definitions
export const NODE_PALETTE = [
  {
    type: NODE_TYPES.START,
    label: 'Start',
    icon: '▶',
    description: 'Workflow entry point',
    color: '#22c55e',
  },
  {
    type: NODE_TYPES.TASK,
    label: 'Task',
    icon: '✓',
    description: 'Assign a task to someone',
    color: '#3b82f6',
  },
  {
    type: NODE_TYPES.APPROVAL,
    label: 'Approval',
    icon: '✦',
    description: 'Requires approval to proceed',
    color: '#f59e0b',
  },
  {
    type: NODE_TYPES.AUTOMATED,
    label: 'Automated',
    icon: '⚡',
    description: 'Trigger an automated action',
    color: '#8b5cf6',
  },
  {
    type: NODE_TYPES.END,
    label: 'End',
    icon: '■',
    description: 'Workflow termination point',
    color: '#ef4444',
  },
];

// Default data per node type
export const DEFAULT_NODE_DATA = {
  [NODE_TYPES.START]: {
    title: 'Start',
    metadata: [],
  },
  [NODE_TYPES.TASK]: {
    title: 'New Task',
    description: '',
    assignee: '',
    dueDate: '',
    customFields: [],
  },
  [NODE_TYPES.APPROVAL]: {
    title: 'Approval Step',
    approverRole: 'Manager',
    autoApproveThreshold: 0,
  },
  [NODE_TYPES.AUTOMATED]: {
    title: 'Automated Step',
    actionId: '',
    params: {},
  },
  [NODE_TYPES.END]: {
    endMessage: 'Workflow completed successfully.',
    summaryFlag: false,
  },
};
