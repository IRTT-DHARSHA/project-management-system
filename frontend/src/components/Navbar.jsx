export default function Navbar({ onToggleNav }) {
  return (
    <header className="topbar">
      <button type="button" className="topbar-toggle" onClick={onToggleNav} aria-label="Toggle navigation">
        ☰
      </button>
      <span style={{ fontWeight: 700 }}>Ledger PMS</span>
      <span style={{ width: 20 }} />
    </header>
  );
}
