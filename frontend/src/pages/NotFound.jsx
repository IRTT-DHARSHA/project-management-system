import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="auth-shell">
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 48, marginBottom: 12 }}>404</h1>
        <p style={{ color: 'var(--color-ink-muted)', marginBottom: 20 }}>
          This page doesn&apos;t exist.
        </p>
        <Link to="/dashboard" className="btn btn-primary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
