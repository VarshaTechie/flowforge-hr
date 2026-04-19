import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import useWorkflowStore from '../../store/workflowStore';
import { APPROVER_ROLES } from '../../types';
import './Inspector.css';

// ─── Field Components ─────────────────────────────────────────────────────────

function FormField({ label, error, children }) {
  return (
    <div className="inspector__field">
      <label className="inspector__label">{label}</label>
      {children}
      {error && <span className="inspector__error">{error}</span>}
    </div>
  );
}

function KeyValueArray({ control, register, name, label }) {
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <div className="inspector__field">
      <label className="inspector__label">{label}</label>
      <div className="kv-list">
        {fields.map((field, index) => (
          <div key={field.id} className="kv-row">
            <input
              {...register(`${name}.${index}.key`)}
              placeholder="Key"
              className="inspector__input kv-input"
            />
            <input
              {...register(`${name}.${index}.value`)}
              placeholder="Value"
              className="inspector__input kv-input"
            />
            <button
              type="button"
              className="kv-remove"
              onClick={() => remove(index)}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          className="inspector__btn--ghost"
          onClick={() => append({ key: '', value: '' })}
        >
          + Add pair
        </button>
      </div>
    </div>
  );
}

// ─── Form per node type ────────────────────────────────────────────────────────

function StartForm({ node, updateNodeData }) {
  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { title: node.data.title || '', metadata: node.data.metadata || [] },
  });

  useEffect(() => {
    reset({ title: node.data.title || '', metadata: node.data.metadata || [] });
  }, [node.id, reset]);

  const onBlur = handleSubmit((values) => updateNodeData(node.id, values));

  return (
    <form onBlur={onBlur} className="inspector__form">
      <FormField label="Title">
        <input {...register('title')} className="inspector__input" placeholder="Workflow start" />
      </FormField>
      <KeyValueArray control={control} register={register} name="metadata" label="Metadata (Key-Value)" />
    </form>
  );
}

function TaskForm({ node, updateNodeData }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: node.data.title || '',
      description: node.data.description || '',
      assignee: node.data.assignee || '',
      dueDate: node.data.dueDate || '',
      customFields: node.data.customFields || [],
    },
  });

  useEffect(() => {
    reset({
      title: node.data.title || '',
      description: node.data.description || '',
      assignee: node.data.assignee || '',
      dueDate: node.data.dueDate || '',
      customFields: node.data.customFields || [],
    });
  }, [node.id, reset]);

  const onBlur = handleSubmit((values) => updateNodeData(node.id, values));

  return (
    <form onBlur={onBlur} className="inspector__form">
      <FormField label="Title *" error={errors.title?.message}>
        <input
          {...register('title', { required: 'Title is required' })}
          className={`inspector__input ${errors.title ? 'inspector__input--error' : ''}`}
          placeholder="Task name"
        />
      </FormField>
      <FormField label="Description">
        <textarea
          {...register('description')}
          className="inspector__textarea"
          placeholder="Describe the task..."
          rows={3}
        />
      </FormField>
      <FormField label="Assignee">
        <input {...register('assignee')} className="inspector__input" placeholder="e.g. HR Manager" />
      </FormField>
      <FormField label="Due Date">
        <input {...register('dueDate')} type="date" className="inspector__input" />
      </FormField>
      <KeyValueArray control={control} register={register} name="customFields" label="Custom Fields" />
    </form>
  );
}

function ApprovalForm({ node, updateNodeData }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: node.data.title || '',
      approverRole: node.data.approverRole || '',
      autoApproveThreshold: node.data.autoApproveThreshold || 0,
    },
  });

  useEffect(() => {
    reset({
      title: node.data.title || '',
      approverRole: node.data.approverRole || '',
      autoApproveThreshold: node.data.autoApproveThreshold || 0,
    });
  }, [node.id, reset]);

  const onBlur = handleSubmit((values) =>
    updateNodeData(node.id, { ...values, autoApproveThreshold: Number(values.autoApproveThreshold) })
  );

  return (
    <form onBlur={onBlur} className="inspector__form">
      <FormField label="Title">
        <input {...register('title')} className="inspector__input" placeholder="Approval step" />
      </FormField>
      <FormField label="Approver Role">
        <select {...register('approverRole')} className="inspector__select">
          <option value="">-- Select Role --</option>
          {APPROVER_ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="Auto-Approve Threshold (%)">
        <input
          {...register('autoApproveThreshold')}
          type="number"
          min={0}
          max={100}
          className="inspector__input"
          placeholder="0 = disabled"
        />
      </FormField>
    </form>
  );
}

function AutomatedForm({ node, updateNodeData, automations }) {
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      title: node.data.title || '',
      actionId: node.data.actionId || '',
      params: node.data.params || {},
    },
  });

  useEffect(() => {
    reset({
      title: node.data.title || '',
      actionId: node.data.actionId || '',
      params: node.data.params || {},
    });
  }, [node.id, reset]);

  const selectedActionId = watch('actionId');
  const selectedAction = automations.find((a) => a.id === selectedActionId);

  const onBlur = handleSubmit((values) => updateNodeData(node.id, values));

  return (
    <form onBlur={onBlur} className="inspector__form">
      <FormField label="Title">
        <input {...register('title')} className="inspector__input" placeholder="Automated step" />
      </FormField>
      <FormField label="Action">
        <select {...register('actionId')} className="inspector__select">
          <option value="">-- Select Action --</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </FormField>

      {selectedAction && selectedAction.params.length > 0 && (
        <div className="inspector__dynamic-params">
          <p className="inspector__params-title">Action Parameters</p>
          {selectedAction.params.map((param) => (
            <FormField key={param.name} label={param.label}>
              {param.type === 'textarea' ? (
                <textarea
                  {...register(`params.${param.name}`)}
                  className="inspector__textarea"
                  rows={2}
                  placeholder={param.label}
                />
              ) : (
                <input
                  {...register(`params.${param.name}`)}
                  type={param.type}
                  className="inspector__input"
                  placeholder={param.label}
                />
              )}
            </FormField>
          ))}
        </div>
      )}
    </form>
  );
}

function EndForm({ node, updateNodeData }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      endMessage: node.data.endMessage || '',
      summaryFlag: node.data.summaryFlag || false,
    },
  });

  useEffect(() => {
    reset({
      endMessage: node.data.endMessage || '',
      summaryFlag: node.data.summaryFlag || false,
    });
  }, [node.id, reset]);

  const onBlur = handleSubmit((values) =>
    updateNodeData(node.id, { ...values, summaryFlag: values.summaryFlag === true || values.summaryFlag === 'true' })
  );

  return (
    <form onBlur={onBlur} className="inspector__form">
      <FormField label="End Message">
        <textarea
          {...register('endMessage')}
          className="inspector__textarea"
          rows={3}
          placeholder="Workflow completed successfully."
        />
      </FormField>
      <FormField label="Generate Summary Report">
        <label className="inspector__toggle">
          <input {...register('summaryFlag')} type="checkbox" />
          <span className="inspector__toggle-slider" />
          <span className="inspector__toggle-label">Enable summary</span>
        </label>
      </FormField>
    </form>
  );
}

// ─── Inspector Panel ──────────────────────────────────────────────────────────

const NODE_LABELS = {
  startNode: { label: 'Start Node', color: '#22c55e', icon: '▶' },
  taskNode: { label: 'Task Node', color: '#3b82f6', icon: '✓' },
  approvalNode: { label: 'Approval Node', color: '#f59e0b', icon: '✦' },
  automatedNode: { label: 'Automated Node', color: '#8b5cf6', icon: '⚡' },
  endNode: { label: 'End Node', color: '#ef4444', icon: '■' },
};

export default function Inspector({ automations }) {
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId);
  const nodes = useWorkflowStore((s) => s.nodes);
  const updateNodeData = useWorkflowStore((s) => s.updateNodeData);
  const deleteNode = useWorkflowStore((s) => s.deleteNode);
  const clearSelection = useWorkflowStore((s) => s.clearSelection);

  const node = nodes.find((n) => n.id === selectedNodeId);

  if (!node) {
    return (
      <aside className="inspector inspector--empty">
        <div className="inspector__placeholder">
          <div className="inspector__placeholder-icon">⚙</div>
          <h3>Node Inspector</h3>
          <p>Select a node on the canvas to configure its properties</p>
        </div>
      </aside>
    );
  }

  const meta = NODE_LABELS[node.type] || { label: 'Node', color: '#6366f1', icon: '?' };

  const handleDelete = () => {
    deleteNode(node.id);
    clearSelection();
  };

  const renderForm = () => {
    switch (node.type) {
      case 'startNode':
        return <StartForm node={node} updateNodeData={updateNodeData} />;
      case 'taskNode':
        return <TaskForm node={node} updateNodeData={updateNodeData} />;
      case 'approvalNode':
        return <ApprovalForm node={node} updateNodeData={updateNodeData} />;
      case 'automatedNode':
        return <AutomatedForm node={node} updateNodeData={updateNodeData} automations={automations} />;
      case 'endNode':
        return <EndForm node={node} updateNodeData={updateNodeData} />;
      default:
        return <p className="inspector__unknown">Unknown node type.</p>;
    }
  };

  return (
    <aside className="inspector">
      <div className="inspector__header" style={{ '--node-color': meta.color }}>
        <div className="inspector__header-left">
          <span className="inspector__header-icon">{meta.icon}</span>
          <div>
            <span className="inspector__header-type">{meta.label}</span>
            <span className="inspector__header-id">ID: {node.id}</span>
          </div>
        </div>
        <button
          className="inspector__delete-btn"
          onClick={handleDelete}
          title="Delete node"
        >
          🗑
        </button>
      </div>

      <div className="inspector__body">{renderForm()}</div>

      <div className="inspector__footer">
        <p className="inspector__footer-hint">
          Changes are saved automatically on blur
        </p>
      </div>
    </aside>
  );
}
