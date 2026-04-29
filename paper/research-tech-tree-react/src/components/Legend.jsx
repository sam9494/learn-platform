export default function Legend({ branches }) {
  return (
    <div className="legend">
      {Object.entries(branches).map(([key, b]) => (
        <div key={key} className="legend-item">
          <div className="legend-dot" style={{ background: b.color }} />
          {b.label}
        </div>
      ))}
    </div>
  );
}
