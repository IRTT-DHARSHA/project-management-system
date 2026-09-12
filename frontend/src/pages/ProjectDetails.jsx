import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getProjectById, updateProject, deleteProject } from '../services/project.service';
import { createTask, updateTask, deleteTask, completeTask } from '../services/task.service';
import { getErrorMessage } from '../services/api';
import { STATUS_LABELS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import TaskCard from '../components/TaskCard.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import ProjectForm from './ProjectForm.jsx';
import TaskForm from './TaskForm.jsx';

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showEditProject, setShowEditProject] = useState(false);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [deletingTask, setDeletingTask] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getProjectById(id)
      .then(setProject)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleEditProjectSubmit = async (payload) => {
    await updateProject(id, payload);
    setShowEditProject(false);
    load();
  };

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await deleteProject(id);
      navigate('/projects');
    } catch (err) {
      setError(getErrorMessage(err));
      setDeletingProject(false);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      if (task.status === 'COMPLETED') {
        await updateTask(task.id, { status: 'PENDING' });
      } else {
        await completeTask(task.id);
      }
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleTaskSubmit = async (payload) => {
    if (editingTask) {
      await updateTask(editingTask.id, payload);
    } else {
      await createTask({ ...payload, projectId: id });
    }
    setShowTaskForm(false);
    setEditingTask(null);
    load();
  };

  const confirmDeleteTask = async () => {
    if (!deleteTaskTarget) return;
    setDeletingTask(true);
    try {
      await deleteTask(deleteTaskTarget.id);
      setDeleteTaskTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeletingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner label="Loading project…" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="page">
        <ErrorMessage message={error || 'Project not found.'} />
        <Link to="/projects">← Back to Projects</Link>
      </div>
    );
  }

  const totalTasks = project.tasks?.length || 0;
  const completedTasks = project.tasks?.filter((t) => t.status === 'COMPLETED').length || 0;
  const progressPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="page">
      <Link to="/projects" style={{ fontSize: 13.5, color: 'var(--color-ink-muted)' }}>
        ← Back to Projects
      </Link>

      <div className="page-header" style={{ marginTop: 12 }}>
        <div>
          <h1>{project.name}</h1>
          {project.description && (
            <p style={{ maxWidth: 560 }}>{project.description}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn btn-secondary" onClick={() => setShowEditProject(true)}>
            Edit Project
          </button>
          <button type="button" className="btn btn-danger" onClick={() => setDeleteProjectConfirm(true)}>
            Delete Project
          </button>
        </div>
      </div>

      <ErrorMessage message={error} />

      <div className="form-row" style={{ marginBottom: 24 }}>
        <div className="card card-pad">
          <div className="item-card-meta" style={{ marginBottom: 12 }}>
            <span className={`badge badge-${project.status}`}>{STATUS_LABELS[project.status]}</span>
            <span>·</span>
            <span>{formatDate(project.startDate)} → {formatDate(project.endDate)}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--color-ink-muted)', marginBottom: 6 }}>
            {completedTasks} of {totalTasks} tasks completed
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="page-header">
        <h2>Tasks</h2>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setEditingTask(null);
            setShowTaskForm(true);
          }}
        >
          + New Task
        </button>
      </div>

      {totalTasks === 0 ? (
        <div className="state-block card">
          <h3>No tasks yet</h3>
          <p>Add your first task to start tracking progress on this project.</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingTask(null);
              setShowTaskForm(true);
            }}
          >
            + New Task
          </button>
        </div>
      ) : (
        <div className="task-list">
          {project.tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onEdit={(t) => {
                setEditingTask(t);
                setShowTaskForm(true);
              }}
              onDelete={setDeleteTaskTarget}
            />
          ))}
        </div>
      )}

      {showEditProject && (
        <ProjectForm
          initialProject={project}
          onSubmit={handleEditProjectSubmit}
          onCancel={() => setShowEditProject(false)}
        />
      )}

      {showTaskForm && (
        <TaskForm
          initialTask={editingTask}
          fixedProjectId={project.id}
          onSubmit={handleTaskSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <ConfirmationModal
        open={deleteProjectConfirm}
        title="Delete project?"
        body={`This will permanently delete "${project.name}" and all of its tasks. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deletingProject}
        onConfirm={handleDeleteProject}
        onCancel={() => setDeleteProjectConfirm(false)}
      />

      <ConfirmationModal
        open={Boolean(deleteTaskTarget)}
        title="Delete task?"
        body={`This will permanently delete "${deleteTaskTarget?.name}".`}
        confirmLabel="Delete"
        danger
        loading={deletingTask}
        onConfirm={confirmDeleteTask}
        onCancel={() => setDeleteTaskTarget(null)}
      />
    </div>
  );
}
