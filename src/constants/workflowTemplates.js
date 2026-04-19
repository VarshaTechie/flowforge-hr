import { NODE_TYPES, DEFAULT_NODE_DATA } from '../types';

const edgeDefaults = {
  animated: true,
  style: { stroke: '#6366f1', strokeWidth: 2 },
  markerEnd: { type: 'arrowclosed', color: '#6366f1' },
};

const createNode = (id, type, x, y, data = {}) => ({
  id,
  type,
  position: { x, y },
  data: { ...DEFAULT_NODE_DATA[type], ...data },
});

const createEdge = (id, source, target, extra = {}) => ({
  id,
  source,
  target,
  ...edgeDefaults,
  ...extra,
});

export const WORKFLOW_TEMPLATES = [
  {
    id: 'onboarding',
    label: 'Onboarding',
    description: 'Employee onboarding workflow.',
    build: () => {
      const nodes = [
        createNode('onboard_start', NODE_TYPES.START, 40, 240, { title: 'Candidate Accepted' }),
        createNode('onboard_docs', NODE_TYPES.TASK, 280, 240, { title: 'Collect Documents', assignee: 'HR Specialist' }),
        createNode('onboard_approval', NODE_TYPES.APPROVAL, 560, 240, { title: 'Manager Approval', approverRole: 'Manager' }),
        createNode('onboard_it', NODE_TYPES.AUTOMATED, 860, 240, { title: 'Send Welcome Email', actionId: 'send_email' }),
        createNode('onboard_end', NODE_TYPES.END, 1120, 240, { endMessage: 'Onboarding completed.' }),
      ];

      const edges = [
        createEdge('onboard_e1', 'onboard_start', 'onboard_docs'),
        createEdge('onboard_e2', 'onboard_docs', 'onboard_approval'),
        createEdge('onboard_e3', 'onboard_approval', 'onboard_it'),
        createEdge('onboard_e4', 'onboard_it', 'onboard_end'),
      ];

      return { nodes, edges };
    },
  },
  {
    id: 'leave-approval',
    label: 'Leave Approval',
    description: 'Leave request routed for approval.',
    build: () => {
      const nodes = [
        createNode('leave_start', NODE_TYPES.START, 40, 240, { title: 'Leave Request Submitted' }),
        createNode('leave_review', NODE_TYPES.TASK, 280, 240, { title: 'Review Request', assignee: 'HR Manager' }),
        createNode('leave_approval', NODE_TYPES.APPROVAL, 560, 240, { title: 'Approve Leave?', approverRole: 'HRBP' }),
        createNode('leave_notify', NODE_TYPES.AUTOMATED, 860, 240, { title: 'Generate Leave Letter', actionId: 'generate_doc' }),
        createNode('leave_end_ok', NODE_TYPES.END, 1120, 240, { endMessage: 'Leave approved and recorded.' }),
      ];

      const edges = [
        createEdge('leave_e1', 'leave_start', 'leave_review'),
        createEdge('leave_e2', 'leave_review', 'leave_approval'),
        createEdge('leave_e3', 'leave_approval', 'leave_notify'),
        createEdge('leave_e4', 'leave_notify', 'leave_end_ok'),
      ];

      return { nodes, edges };
    },
  },
  {
    id: 'offboarding',
    label: 'Offboarding',
    description: 'Employee exit flow with approvals and revocation.',
    build: () => {
      const nodes = [
        createNode('off_start', NODE_TYPES.START, 40, 240, { title: 'Resignation Received' }),
        createNode('off_handover', NODE_TYPES.TASK, 280, 240, { title: 'Knowledge Handover', assignee: 'Employee' }),
        createNode('off_approval', NODE_TYPES.APPROVAL, 560, 240, { title: 'Final Signoff', approverRole: 'Director' }),
        createNode('off_revoke', NODE_TYPES.AUTOMATED, 860, 240, { title: 'Generate Exit Checklist', actionId: 'generate_doc' }),
        createNode('off_end', NODE_TYPES.END, 1120, 240, { endMessage: 'Offboarding completed.' }),
      ];

      const edges = [
        createEdge('off_e1', 'off_start', 'off_handover'),
        createEdge('off_e2', 'off_handover', 'off_approval'),
        createEdge('off_e3', 'off_approval', 'off_revoke'),
        createEdge('off_e4', 'off_revoke', 'off_end'),
      ];

      return { nodes, edges };
    },
  },
];
