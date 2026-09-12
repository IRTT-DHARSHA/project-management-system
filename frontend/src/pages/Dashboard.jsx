import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboard.service';
import { getErrorMessage } from '../services/api';
import { STATUS_LABELS, PRIORITY_LABELS } from '../utils/constants';
import StatCard from '../components/StatCard.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import useAuth from '../hooks/useAuth';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getDashboardStats()
      .then((res) => mounted && setData(res))
      .catch((err) => mounted && setError(getErrorMessage(err)))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}</h1>
          <p>Here&apos;s what&apos;s happening across your projects.</p>
        </div>
      </div>

      <ErrorMessage message={error} />

      {data && (
        <>
          <div className="stats-grid">
            <StatCard label="Total Projects" value={data.stats.totalProjects} />
            <StatCard label="Projects In Progress" value={data.stats.projectsInProgress} />
            <StatCard label="Total Tasks" value={data.stats.totalTasks} />
            <StatCard label="Completed Tasks" value={data.stats.completedTasks} />
            <StatCard label="Pending Tasks" value={data.stats.pendingTasks} />
          </div>

          <div className="form-row" style={{ alignItems: 'start' }}>
            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Recent Projects</h2>
                <Link to="/projects">View all</Link>
              </div>
              {data.recentProjects.length === 0 ? (
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 13.5 }}>No projects yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.recentProjects.map((p) => (
                    <Link
                      key={p.id}
                      to={`/projects/${p.id}`}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                      <span style={{ color: 'var(--color-ink)', fontSize: 14 }}>{p.name}</span>
                      <span className={`badge badge-${p.status}`}>{STATUS_LABELS[p.status]}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="card card-pad">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2>Recent Tasks</h2>
                <Link to="/tasks">View all</Link>
              </div>
              {data.recentTasks.length === 0 ? (
                <p style={{ color: 'var(--color-ink-muted)', fontSize: 13.5 }}>No tasks yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {data.recentTasks.map((t) => (
                    <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 14 }}>{t.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>{t.project?.name}</div>
                      </div>
                      <span className={`badge badge-${t.priority}`}>{PRIORITY_LABELS[t.priority]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
