import { PRIORITY_LABELS, STATUS_LABELS } from '../utils/constants';

function formatDate(d) {
  if (!d) return 'No due date';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function TaskCard({ task, onToggleComplete, onEdit, onDelete, showProject = false }) {
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div className="task-row">
      <button
        type="button"
        className={`task-check ${isCompleted ? 'checked' : ''}`}
        onClick={() => onToggleComplete(task)}
        aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        title={isCompleted ? 'Completed' : 'Mark as completed'}
      >
        {isCompleted ? '✓' : ''}
      </button>

      <div className="task-row-main">
        <h3 style={{ textDecoration: isCompleted ? 'line-through' : 'none', color: isCompleted ? 'var(--color-ink-faint)' : 'inherit' }}>
          {task.name}
        </h3>
        <p>
          {showProject && task.project ? `${task.project.name} · ` : ''}
          Due {formatDate(task.dueDate)}
        </p>
      </div>

      <div className="task-row-meta">
        <span className={`badge badge-${task.priority}`}>{PRIORITY_LABELS[task.priority]}</span>
        <span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span>
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDelete(task)}>
          Delete
        </button>
      </div>
    </div>
  );
}
