import { Handle, Position } from '@xyflow/react';
import useWorkflowStore from '../../store/workflowStore';
import './nodes.css';

export function StartNode({ id, data, selected }) {
  const selectNode = useWorkflowStore((s) => s.selectNode);

  return (
    <div
      className={`flow-node flow-node--start ${selected ? 'flow-node--selected' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
    >
      <div className="flow-node__icon">{'>'}</div>
      <div className="flow-node__content">
        <span className="flow-node__type-label">Start</span>
        <span className="flow-node__title">{data.title || 'Start'}</span>
      </div>
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}

export function TaskNode({ id, data, selected }) {
  const selectNode = useWorkflowStore((s) => s.selectNode);

  return (
    <div
      className={`flow-node flow-node--task ${selected ? 'flow-node--selected' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
    >
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <div className="flow-node__icon">T</div>
      <div className="flow-node__content">
        <span className="flow-node__type-label">Task</span>
        <span className="flow-node__title">{data.title || 'Task'}</span>
        {data.assignee && <span className="flow-node__meta">Assignee: {data.assignee}</span>}
        {data.dueDate && <span className="flow-node__meta">Due: {data.dueDate}</span>}
      </div>
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}

export function ApprovalNode({ id, data, selected }) {
  const selectNode = useWorkflowStore((s) => s.selectNode);

  return (
    <div
      className={`flow-node flow-node--approval ${selected ? 'flow-node--selected' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
    >
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <div className="flow-node__icon">?</div>
      <div className="flow-node__content">
        <span className="flow-node__type-label">Approval</span>
        <span className="flow-node__title">{data.title || 'Approval'}</span>
        {data.approverRole && <span className="flow-node__meta">Role: {data.approverRole}</span>}
      </div>
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}

export function AutomatedNode({ id, data, selected }) {
  const selectNode = useWorkflowStore((s) => s.selectNode);

  return (
    <div
      className={`flow-node flow-node--automated ${selected ? 'flow-node--selected' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
    >
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <div className="flow-node__icon">A</div>
      <div className="flow-node__content">
        <span className="flow-node__type-label">Automated</span>
        <span className="flow-node__title">{data.title || 'Automated'}</span>
        {data.actionId && <span className="flow-node__meta">Action: {data.actionId}</span>}
      </div>
      <Handle type="source" position={Position.Right} className="flow-handle" />
    </div>
  );
}

export function EndNode({ id, data, selected }) {
  const selectNode = useWorkflowStore((s) => s.selectNode);

  return (
    <div
      className={`flow-node flow-node--end ${selected ? 'flow-node--selected' : ''}`}
      onClick={(event) => {
        event.stopPropagation();
        selectNode(id);
      }}
    >
      <Handle type="target" position={Position.Left} className="flow-handle" />
      <div className="flow-node__icon">X</div>
      <div className="flow-node__content">
        <span className="flow-node__type-label">End</span>
        <span className="flow-node__title">{data.endMessage || 'End'}</span>
      </div>
    </div>
  );
}
