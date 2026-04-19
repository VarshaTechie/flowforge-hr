// Mock API layer — simulates real HTTP calls with artificial delay

const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

// ─── GET /automations ────────────────────────────────────────────────────────
export async function getAutomations() {
  await delay(200);
  return [
    {
      id: 'send_email',
      label: 'Send Email',
      params: [
        { name: 'to', label: 'Recipient Email', type: 'email' },
        { name: 'subject', label: 'Subject', type: 'text' },
      ],
    },
    {
      id: 'generate_doc',
      label: 'Generate Document',
      params: [
        { name: 'template', label: 'Template Name', type: 'text' },
        { name: 'recipient', label: 'Recipient', type: 'text' },
      ],
    },
  ];
}

// ─── POST /simulate ───────────────────────────────────────────────────────────
export async function simulateWorkflow(workflowData) {
  await delay(600);

  const { nodes, edges } = workflowData;

  if (!nodes || nodes.length === 0) {
    throw new Error('Workflow has no nodes to simulate.');
  }

  // Build adjacency map
  const edgeMap = {};
  edges.forEach(({ source, target }) => {
    if (!edgeMap[source]) edgeMap[source] = [];
    edgeMap[source].push(target);
  });

  // Find start node
  const startNode = nodes.find((n) => n.type === 'startNode');
  if (!startNode) throw new Error('No Start node found.');

  // BFS traversal to produce steps
  const steps = [];
  const visited = new Set();
  const queue = [startNode.id];

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const node = nodes.find((n) => n.id === currentId);
    if (!node) continue;

    const data = node.data || {};
    const stepNum = steps.length + 1;

    switch (node.type) {
      case 'startNode':
        steps.push({
          step: stepNum,
          nodeId: node.id,
          type: 'start',
          status: 'success',
          message: `▶ Workflow started: "${data.title || 'Start'}"`,
        });
        break;
      case 'taskNode':
        steps.push({
          step: stepNum,
          nodeId: node.id,
          type: 'task',
          status: 'success',
          message: `✓ Task assigned: "${data.title || 'Task'}" → ${data.assignee || 'Unassigned'}${data.dueDate ? ` (Due: ${data.dueDate})` : ''}`,
        });
        break;
      case 'approvalNode':
        steps.push({
          step: stepNum,
          nodeId: node.id,
          type: 'approval',
          status: 'success',
          message: `✦ Approval requested: "${data.title || 'Approval'}" — Role: ${data.approverRole || 'Any'}${
            data.autoApproveThreshold > 0
              ? ` (Auto-approve threshold: ${data.autoApproveThreshold}%)`
              : ''
          }`,
        });
        break;
      case 'automatedNode':
        steps.push({
          step: stepNum,
          nodeId: node.id,
          type: 'automated',
          status: 'success',
          message: `⚡ Automated action triggered: "${data.title || 'Automated'}" — Action: ${data.actionId || 'None'}`,
        });
        break;
      case 'endNode':
        steps.push({
          step: stepNum,
          nodeId: node.id,
          type: 'end',
          status: 'success',
          message: `■ Workflow ended: "${data.endMessage || 'Completed'}"${data.summaryFlag ? ' [Summary generated]' : ''}`,
        });
        break;
      default:
        steps.push({
          step: stepNum,
          nodeId: node.id,
          type: 'unknown',
          status: 'warning',
          message: `? Unknown node type encountered`,
        });
    }

    // Enqueue next nodes
    const nextIds = edgeMap[currentId] || [];
    nextIds.forEach((id) => queue.push(id));
  }

  return {
    success: true,
    totalSteps: steps.length,
    executedAt: new Date().toISOString(),
    steps,
  };
}
