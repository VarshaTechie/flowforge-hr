/**
 * @typedef {'startNode' | 'taskNode' | 'approvalNode' | 'automatedNode' | 'endNode'} WorkflowNodeType
 */

/**
 * @typedef {{ key: string, value: string }} KeyValuePair
 */

/**
 * @typedef {{
 *   title: string,
 *   metadata: KeyValuePair[]
 * }} StartNodeData
 */

/**
 * @typedef {{
 *   title: string,
 *   description: string,
 *   assignee: string,
 *   dueDate: string,
 *   customFields: KeyValuePair[]
 * }} TaskNodeData
 */

/**
 * @typedef {{
 *   title: string,
 *   approverRole: 'Manager' | 'HRBP' | 'Director',
 *   autoApproveThreshold: number
 * }} ApprovalNodeData
 */

/**
 * @typedef {{
 *   title: string,
 *   actionId: string,
 *   params: Record<string, string>
 * }} AutomatedNodeData
 */

/**
 * @typedef {{
 *   endMessage: string,
 *   summaryFlag: boolean
 * }} EndNodeData
 */

/**
 * @typedef {StartNodeData | TaskNodeData | ApprovalNodeData | AutomatedNodeData | EndNodeData} WorkflowNodeData
 */

/**
 * @typedef {{
 *   id: string,
 *   type: WorkflowNodeType,
 *   position: { x: number, y: number },
 *   data: WorkflowNodeData,
 *   selected?: boolean
 * }} WorkflowNode
 */

/**
 * @typedef {{
 *   id: string,
 *   source: string,
 *   target: string,
 *   sourceHandle?: string | null,
 *   targetHandle?: string | null,
 *   selected?: boolean
 * }} WorkflowEdge
 */

/**
 * @typedef {{
 *   nodes: WorkflowNode[],
 *   edges: WorkflowEdge[],
 *   selectedNodeId?: string | null,
 *   theme?: 'dark' | 'light'
 * }} WorkflowJSON
 */

export const WORKFLOW_TYPE_DOCS = {
  nodeKinds: ['startNode', 'taskNode', 'approvalNode', 'automatedNode', 'endNode'],
};
