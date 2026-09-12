export default function FilterControls({ filters }) {
  // filters: [{ label, value, onChange, options: [{value,label}] }]
  return (
    <>
      {filters.map((f) => (
        <select
          key={f.label}
          className="select filter-select"
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
          aria-label={f.label}
        >
          <option value="">{f.label}</option>
          {f.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}
    </>
  );
}
