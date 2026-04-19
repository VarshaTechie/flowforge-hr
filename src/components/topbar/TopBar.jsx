import useWorkflowStore from '../../store/workflowStore';
import './TopBar.css';

export default function TopBar({
  onRunWorkflow,
  onClearWorkflow,
  onSave,
  onLoad,
  onExportJSON,
  onImportJSON,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onApplyTemplate,
  theme,
  onToggleTheme,
}) {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);

  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  return (
    <header className="topbar">
      <div className="topbar__brand">
        <span className="topbar__brand-icon">FF</span>
        <div className="topbar__brand-text">
          <span className="topbar__brand-name">FlowForge</span>
          <span className="topbar__brand-sub">HR Workflow Designer</span>
        </div>
      </div>

      <div className="topbar__stats">
        <div className="topbar__stat">
          <span className="topbar__stat-value">{nodeCount}</span>
          <span className="topbar__stat-label">Nodes</span>
        </div>
        <div className="topbar__divider" />
        <div className="topbar__stat">
          <span className="topbar__stat-value">{edgeCount}</span>
          <span className="topbar__stat-label">Connections</span>
        </div>
      </div>

      <div className="topbar__actions">
        <select
          className="topbar__select"
          defaultValue=""
          onChange={(event) => {
            if (!event.target.value) return;
            onApplyTemplate(event.target.value);
            event.target.value = '';
          }}
          title="Apply a workflow template"
        >
          <option value="" disabled>
            Templates
          </option>
          <option value="onboarding">Onboarding</option>
          <option value="leave-approval">Leave Approval</option>
          <option value="offboarding">Offboarding</option>
        </select>

        <button
          className="topbar__btn topbar__btn--ghost"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl/Cmd + Z)"
        >
          Undo
        </button>
        <button
          className="topbar__btn topbar__btn--ghost"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl/Cmd + Shift + Z)"
        >
          Redo
        </button>

        <button className="topbar__btn topbar__btn--ghost" onClick={onSave} title="Save to localStorage">
          Save
        </button>
        <button className="topbar__btn topbar__btn--ghost" onClick={onLoad} title="Load from localStorage">
          Load
        </button>
        <button className="topbar__btn topbar__btn--ghost" onClick={onExportJSON} title="Download JSON">
          Export
        </button>
        <button className="topbar__btn topbar__btn--ghost" onClick={onImportJSON} title="Import JSON file">
          Import
        </button>

        <button
          className="topbar__btn topbar__btn--ghost"
          onClick={onToggleTheme}
          title="Toggle dark/light mode"
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        <button className="topbar__btn topbar__btn--ghost" onClick={onClearWorkflow} title="Clear canvas">
          Clear
        </button>
        <button className="topbar__btn topbar__btn--primary" onClick={onRunWorkflow} title="Run workflow simulation">
          Run
        </button>
      </div>
    </header>
  );
}
