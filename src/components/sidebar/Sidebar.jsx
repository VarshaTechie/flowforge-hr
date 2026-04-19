import { NODE_PALETTE } from '../../types';
import './Sidebar.css';

const DraggableItem = ({ type, label, icon, description, color }) => {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/flowforge-node-type', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      className="sidebar__node-item"
      draggable
      onDragStart={handleDragStart}
      style={{ '--node-color': color }}
      title={description}
    >
      <div className="sidebar__node-icon">{icon}</div>
      <div className="sidebar__node-info">
        <span className="sidebar__node-label">{label}</span>
        <span className="sidebar__node-desc">{description}</span>
      </div>
      <div className="sidebar__drag-hint">⠿</div>
    </div>
  );
};

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">⬡</span>
          <div>
            <span className="sidebar__logo-title">FlowForge</span>
            <span className="sidebar__logo-sub">HR</span>
          </div>
        </div>
        <p className="sidebar__hint">Drag nodes onto the canvas to build your workflow</p>
      </div>

      <div className="sidebar__section">
        <h3 className="sidebar__section-title">Node Palette</h3>
        <div className="sidebar__nodes">
          {NODE_PALETTE.map((item) => (
            <DraggableItem key={item.type} {...item} />
          ))}
        </div>
      </div>

      <div className="sidebar__footer">
        <div className="sidebar__tip">
          <span className="sidebar__tip-icon">💡</span>
          <span>Click a node on the canvas to configure it in the inspector panel.</span>
        </div>
      </div>
    </aside>
  );
}
