import { Link } from 'react-router-dom';
import { STATUS_LABELS } from '../utils/constants';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectCard({ project, onEdit, onDelete }) {
  return (
    <div className="item-card">
      <div className="item-card-top">
        <h3>
          <Link to={`/projects/${project.id}`}>{project.name}</Link>
        </h3>
        <span className={`badge badge-${project.status}`}>{STATUS_LABELS[project.status]}</span>
      </div>

      {project.description && <p className="item-card-desc">{project.description}</p>}

      <div className="item-card-meta">
        <span>{formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
        <span>·</span>
        <span>{project._count?.tasks ?? 0} tasks</span>
      </div>

      <div className="item-card-actions">
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => onEdit(project)}>
          Edit
        </button>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => onDelete(project)}>
          Delete
        </button>
      </div>
    </div>
  );
}
