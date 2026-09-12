import { useEffect, useState, useCallback } from 'react';
import { getProjects, createProject, updateProject, deleteProject } from '../services/project.service';
import { getErrorMessage } from '../services/api';
import { PROJECT_STATUSES, STATUS_LABELS } from '../utils/constants';
import useDebounce from '../hooks/useDebounce';
import SearchBar from '../components/SearchBar.jsx';
import FilterControls from '../components/FilterControls.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ConfirmationModal from '../components/ConfirmationModal.jsx';
import ProjectForm from './ProjectForm.jsx';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 350);

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getProjects({ search: debouncedSearch || undefined, status: status || undefined })
      .then(setProjects)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [debouncedSearch, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditingProject(null);
    setShowForm(true);
  };

  const openEdit = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSubmit = async (payload) => {
    if (editingProject) {
      await updateProject(editingProject.id, payload);
    } else {
      await createProject(payload);
    }
    setShowForm(false);
    setEditingProject(null);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
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
          <h1>Projects</h1>
          <p>Create and track all of your projects in one place.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openCreate}>
          + New Project
        </button>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search projects…" />
        <FilterControls
          filters={[
            {
              label: 'All statuses',
              value: status,
              onChange: setStatus,
              options: PROJECT_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] })),
            },
          ]}
        />
      </div>

      <ErrorMessage message={error} />

      {loading ? (
        <LoadingSpinner label="Loading projects…" />
      ) : projects.length === 0 ? (
        <div className="state-block card">
          <h3>No projects found</h3>
          <p>{search || status ? 'Try adjusting your search or filters.' : 'Create your first project to get started.'}</p>
          {!search && !status && (
            <button type="button" className="btn btn-primary" onClick={openCreate}>
              + New Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProjectForm
          initialProject={editingProject}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingProject(null);
          }}
        />
      )}

      <ConfirmationModal
        open={Boolean(deleteTarget)}
        title="Delete project?"
        body={`This will permanently delete "${deleteTarget?.name}" and all of its tasks. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
