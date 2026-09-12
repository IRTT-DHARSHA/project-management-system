import { useState } from 'react';
import { TASK_PRIORITIES, TASK_STATUSES, PRIORITY_LABELS, STATUS_LABELS } from '../utils/constants';
import { getErrorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage.jsx';

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TaskForm({ initialTask, projects, fixedProjectId, onSubmit, onCancel }) {
  const isEdit = Boolean(initialTask);
  const [form, setForm] = useState({
    name: initialTask?.name || '',
    description: initialTask?.description || '',
    priority: initialTask?.priority || 'MEDIUM',
    status: initialTask?.status || 'PENDING',
    dueDate: toInputDate(initialTask?.dueDate),
    projectId: initialTask?.projectId || fixedProjectId || (projects?.[0]?.id ?? ''),
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Task name is required';
    if (!form.projectId) next.projectId = 'Select a project';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
        projectId: form.projectId,
      });
    } catch (err) {
      setApiError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="t-name">Task name</label>
            <input
              id="t-name"
              className={`input ${errors.name ? 'has-error' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="t-desc">Description</label>
            <textarea
              id="t-desc"
              className="textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {!fixedProjectId && projects && (
            <div className="field">
              <label htmlFor="t-project">Project</label>
              <select
                id="t-project"
                className={`select ${errors.projectId ? 'has-error' : ''}`}
                value={form.projectId}
                onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              >
                <option value="">Select a project…</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.projectId && <span className="field-error">{errors.projectId}</span>}
            </div>
          )}

          <div className="form-row">
            <div className="field">
              <label htmlFor="t-priority">Priority</label>
              <select
                id="t-priority"
                className="select"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="t-status">Status</label>
              <select
                id="t-status"
                className="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="t-due">Due date</label>
            <input
              id="t-due"
              type="date"
              className="input"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
