import { useCallback, useEffect, useState } from 'react';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../services/task.service';
import { getProjects } from '../services/project.service';
import { getErrorMessage } from '../services/api';
import { TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS } from '../utils/constants';
import useDebounce from '../hooks/useDebounce';
import SearchBar from '../components/SearchBar.jsx';
import FilterControls from '../components/FilterControls.jsx';
import TaskCard from '../components/TaskCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import TaskForm from './TaskForm.jsx';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getTasks({
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
    })
      .then(setTasks)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [debouncedSearch, status, priority]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    getProjects().then(setProjects).catch(() => {});
  }, []);

  const openCreate = () => {
    setEditingTask(null);
    setShowForm(true);
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

  const handleSubmit = async (payload) => {
    if (editingTask) {
      await updateTask(editingTask.id, payload);
    } else {
      await createTask(payload);
    }
    setShowForm(false);
    setEditingTask(null);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTask(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tasks</h1>
          <p>All tasks across your projects, in one view.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate} disabled={projects.length === 0}>
          + New Task
        </button>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search tasks…" />
        <FilterControls
          filters={[
            {
              label: 'All statuses',
              value: status,
              onChange: setStatus,
              options: TASK_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
            },
            {
              label: 'All priorities',
              value: priority,
              onChange: setPriority,
              options: TASK_PRIORITIES.map((p) => ({ value: p, label: PRIORITY_LABELS[p] })),
            },
          ]}
        />
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner label="Loading tasks…" />
      ) : tasks.length === 0 ? (
        <div className="state-block card">
          <h3>No tasks found</h3>
          <p>
            {search || status || priority
              ? 'Try adjusting your search or filters.'
              : projects.length === 0
              ? 'Create a project first, then add tasks to it.'
              : 'Create your first task to get started.'}
          </p>
          {!search && !status && !priority && projects.length > 0 && (
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              + New Task
            </button>
          )}
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              showProject
              onToggleComplete={handleToggleComplete}
              onEdit={(t) => {
                setEditingTask(t);
                setShowForm(true);
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showForm && (
        <TaskForm
          initialTask={editingTask}
          projects={projects}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete task?"
        body={`This will permanently delete "${deleteTarget?.name}".`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
