import { useState } from 'react';
import useWorkflowStore from '../../store/workflowStore';
import { simulateWorkflow } from '../../api/mockApi';
import './Sandbox.css';

const STEP_ICONS = {
  start: '▶',
  task: '✓',
  approval: '✦',
  automated: '⚡',
  end: '■',
  unknown: '?',
};

const STEP_COLORS = {
  start: '#22c55e',
  task: '#3b82f6',
  approval: '#f59e0b',
  automated: '#8b5cf6',
  end: '#ef4444',
  unknown: '#64748b',
};

export default function Sandbox({ isOpen, onClose }) {
  const { getWorkflowJSON, validateWorkflow } = useWorkflowStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState([]);

  const handleRun = async () => {
    setErrors([]);
    setResult(null);

    // Validate first
    const validationErrors = validateWorkflow();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const workflowJSON = getWorkflowJSON();
      const res = await simulateWorkflow(workflowJSON);
      setResult(res);
    } catch (err) {
      setErrors([err.message]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setErrors([]);
  };

  if (!isOpen) return null;

  return (
    <div className="sandbox-overlay" onClick={onClose}>
      <div className="sandbox" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sandbox__header">
          <div className="sandbox__header-left">
            <span className="sandbox__header-icon">⚗</span>
            <div>
              <h2 className="sandbox__title">Workflow Sandbox</h2>
              <p className="sandbox__subtitle">Simulate workflow execution step-by-step</p>
            </div>
          </div>
          <button className="sandbox__close" onClick={onClose}>×</button>
        </div>

        {/* Actions */}
        <div className="sandbox__actions">
          <button
            className="sandbox__run-btn"
            onClick={handleRun}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="sandbox__spinner" />
                Simulating...
              </>
            ) : (
              <>▶ Run Simulation</>
            )}
          </button>
          {(result || errors.length > 0) && (
            <button className="sandbox__reset-btn" onClick={handleReset}>
              ↺ Reset
            </button>
          )}
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="sandbox__errors">
            <p className="sandbox__errors-title">⚠ Validation Failed</p>
            <ul>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="sandbox__results">
            <div className="sandbox__results-header">
              <span className="sandbox__results-badge">
                ✓ Execution Complete
              </span>
              <span className="sandbox__results-meta">
                {result.totalSteps} steps · {new Date(result.executedAt).toLocaleTimeString()}
              </span>
            </div>

            <div className="sandbox__steps">
              {result.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="sandbox__step"
                  style={{ '--step-color': STEP_COLORS[step.type] || '#6366f1' }}
                >
                  <div className="sandbox__step-number">
                    <span>{step.step}</span>
                  </div>
                  <div className="sandbox__step-icon">{STEP_ICONS[step.type] || '?'}</div>
                  <div className="sandbox__step-content">
                    <span className="sandbox__step-message">{step.message}</span>
                    <span className={`sandbox__step-status sandbox__step-status--${step.status}`}>
                      {step.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!result && !loading && errors.length === 0 && (
          <div className="sandbox__idle">
            <div className="sandbox__idle-icon">⚗</div>
            <p>Click <strong>Run Simulation</strong> to test your workflow</p>
          </div>
        )}
      </div>
    </div>
  );
}
