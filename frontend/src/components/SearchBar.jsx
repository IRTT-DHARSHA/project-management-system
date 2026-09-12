export default function SearchBar({ value, onChange, placeholder = 'Search…' }) {
  return (
    <div className="search-input-wrap">
      <span className="search-icon">⌕</span>
      <input
        className="input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
