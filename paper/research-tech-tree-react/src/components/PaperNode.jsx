import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function PaperNode({ data, selected }) {
  return (
    <div className={`paper-node${selected ? ' is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      {/* category color bar at top */}
      <div className="node-color-bar" style={{ background: data.branchColor }} />

      <div className="node-body">
        <div className="node-era-label">{data.era}</div>

        <div className="node-year-row">
          <div className="node-year">{data.year}</div>
          <div
            className="node-branch-dot"
            style={{ background: data.branchColor }}
          />
          <span className="node-branch-label">
            {data.branchLabel}
          </span>
        </div>

        <div className="node-title">
          {data.title.length > 70 ? data.title.slice(0, 67) + '\u2026' : data.title}
        </div>

        <div className="node-author">{data.authors}</div>

        {data.badge && <span className="node-badge">{data.badge}</span>}
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

export default memo(PaperNode);
