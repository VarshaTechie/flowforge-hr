import { useCallback, useRef } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import useWorkflowStore from '../../store/workflowStore';
import { StartNode, TaskNode, ApprovalNode, AutomatedNode, EndNode } from '../nodes';
import { NODE_TYPES } from '../../types';
import './Canvas.css';

const nodeTypes = {
  [NODE_TYPES.START]: StartNode,
  [NODE_TYPES.TASK]: TaskNode,
  [NODE_TYPES.APPROVAL]: ApprovalNode,
  [NODE_TYPES.AUTOMATED]: AutomatedNode,
  [NODE_TYPES.END]: EndNode,
};

function CanvasInner() {
  const reactFlowWrapper = useRef(null);
  const { screenToFlowPosition } = useReactFlow();

  const {
    nodes,
    edges,
    theme,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    deleteEdge,
    selectNode,
    clearSelection,
  } = useWorkflowStore();

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/flowforge-node-type');
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const result = addNode(type, position);
      if (result?.error) {
        window.alert(result.error);
      }
    },
    [screenToFlowPosition, addNode]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      const selectedNode = nodes.find((node) => node.selected);
      if (selectedNode) deleteNode(selectedNode.id);
      const selectedEdge = edges.find((edge) => edge.selected);
      if (selectedEdge) deleteEdge(selectedEdge.id);
    },
    [nodes, edges, deleteNode, deleteEdge]
  );

  const onPaneClick = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const onNodeClick = useCallback(
    (_event, node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper} onKeyDown={onKeyDown} tabIndex={0}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onPaneClick={onPaneClick}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        deleteKeyCode={null}
        colorMode={theme}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={theme === 'dark' ? '#1e2235' : '#cdd6ea'}
        />
        <Controls className="canvas-controls" />
        <MiniMap
          className="canvas-minimap"
          nodeColor={(node) => {
            const map = {
              startNode: '#22c55e',
              taskNode: '#3b82f6',
              approvalNode: '#f59e0b',
              automatedNode: '#8b5cf6',
              endNode: '#ef4444',
            };
            return map[node.type] || '#6366f1';
          }}
          maskColor={theme === 'dark' ? 'rgba(15,17,23,0.7)' : 'rgba(239,243,252,0.6)'}
        />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="canvas-empty">
          <div className="canvas-empty__icon">+</div>
          <h2 className="canvas-empty__title">Canvas is empty</h2>
          <p className="canvas-empty__sub">
            Drag nodes from the left sidebar to start building your workflow.
          </p>
        </div>
      )}
    </div>
  );
}

export default function Canvas() {
  return <CanvasInner />;
}
