export default function LoadingSpinner({ inline = false, label }) {
  if (inline) {
    return <span className="spinner spinner-inline" role="status" aria-label={label || 'Loading'} />;
  }
  return (
    <div className="state-block">
      <div className="spinner" role="status" aria-label={label || 'Loading'} />
      {label && <p style={{ marginTop: 12 }}>{label}</p>}
    </div>
  );
}
