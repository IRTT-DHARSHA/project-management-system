import { useState } from 'react';
import { PROJECT_STATUSES, STATUS_LABELS } from '../utils/constants';
import { isEndDateValid } from '../utils/validators';
import { getErrorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage.jsx';

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function ProjectForm({ initialProject, onSubmit, onCancel }) {
  const isEdit = Boolean(initialProject);
  const [form, setForm] = useState({
    name: initialProject?.name || '',
    description: initialProject?.description || '',
    status: initialProject?.status || 'NOT_STARTED',
    startDate: toInputDate(initialProject?.startDate),
    endDate: toInputDate(initialProject?.endDate),
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Project name is required';
    if (!isEndDateValid(form.startDate, form.endDate)) {
      next.endDate = 'End date cannot be before start date';
    }
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
        status: form.status,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      });
    } catch (err) {
      setApiError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h2 className="modal-title">{isEdit ? 'Edit Project' : 'New Project'}</h2>

        <ErrorMessage message={apiError} />

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="p-name">Project name</label>
            <input
              id="p-name"
              className={`input ${errors.name ? 'has-error' : ''}`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="field">
            <label htmlFor="p-desc">Description</label>
            <textarea
              id="p-desc"
              className="textarea"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="p-status">Status</label>
            <select
              id="p-status"
              className="select"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="p-start">Start date</label>
              <input
                id="p-start"
                type="date"
                className="input"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </div>
            <div className="field">
              <label htmlFor="p-end">End date</label>
              <input
                id="p-end"
                type="date"
                className={`input ${errors.endDate ? 'has-error' : ''}`}
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
              {errors.endDate && <span className="field-error">{errors.endDate}</span>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
