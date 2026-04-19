import { useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';

import Sidebar from './components/sidebar/Sidebar';
import Canvas from './components/canvas/Canvas';
import Inspector from './components/inspector/Inspector';
import TopBar from './components/topbar/TopBar';
import Sandbox from './components/sandbox/Sandbox';

import useWorkflowStore from './store/workflowStore';
import useAutomations from './hooks/useAutomations';
import useHistoryShortcuts from './hooks/useHistoryShortcuts';
import useThemeSync from './hooks/useThemeSync';

import './App.css';

export default function App() {
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const automations = useAutomations();
  const fileInputRef = useRef(null);

  const clearWorkflow = useWorkflowStore((s) => s.clearWorkflow);
  const applyTemplate = useWorkflowStore((s) => s.applyTemplate);
  const undo = useWorkflowStore((s) => s.undo);
  const redo = useWorkflowStore((s) => s.redo);
  const saveToLocalStorage = useWorkflowStore((s) => s.saveToLocalStorage);
  const loadFromLocalStorage = useWorkflowStore((s) => s.loadFromLocalStorage);
  const importWorkflowFromJSON = useWorkflowStore((s) => s.importWorkflowFromJSON);
  const getWorkflowJSON = useWorkflowStore((s) => s.getWorkflowJSON);
  const toggleTheme = useWorkflowStore((s) => s.toggleTheme);
  const theme = useWorkflowStore((s) => s.theme);
  const canUndo = useWorkflowStore((s) => s.historyPast.length > 0);
  const canRedo = useWorkflowStore((s) => s.historyFuture.length > 0);
  const nodeCount = useWorkflowStore((s) => s.nodes.length);
  useThemeSync(theme);
  useHistoryShortcuts(undo, redo);

  const handleClear = () => {
    if (window.confirm('Clear the entire workflow? This cannot be undone.')) {
      clearWorkflow();
    }
  };

  const handleSave = () => {
    saveToLocalStorage();
  };

  const handleLoad = () => {
    const result = loadFromLocalStorage();
    if (!result.ok) {
      window.alert(result.error);
    }
  };

  const handleApplyTemplate = (templateId) => {
    if (
      nodeCount > 0 &&
      !window.confirm('Replace current workflow with selected template?')
    ) {
      return;
    }
    const result = applyTemplate(templateId);
    if (!result.ok) {
      window.alert(result.error);
    }
  };

  const handleExportJSON = () => {
    const payload = getWorkflowJSON();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `flowforge-workflow-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = importWorkflowFromJSON(text);
    if (!result.ok) {
      window.alert(result.error);
    }

    event.target.value = '';
  };

  return (
    <div className="app">
      <TopBar
        onRunWorkflow={() => setSandboxOpen(true)}
        onClearWorkflow={handleClear}
        onSave={handleSave}
        onLoad={handleLoad}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportClick}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onApplyTemplate={handleApplyTemplate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={handleImportFile}
      />

      <div className="app__body">
        <Sidebar />
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
        <Inspector automations={automations} />
      </div>
      <Sandbox isOpen={sandboxOpen} onClose={() => setSandboxOpen(false)} />
    </div>
  );
}
