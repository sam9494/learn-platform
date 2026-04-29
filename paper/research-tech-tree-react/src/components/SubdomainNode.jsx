import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';

function SubdomainNode({ data, selected }) {
  return (
    <div className={`subdomain-node${selected ? ' is-selected' : ''}`}>
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />

      <div className="sub-node-bar" style={{ background: data.color }} />

      <div className="sub-node-body">
        <div className="sub-node-year">since {data.yearStart}</div>
        <div className="sub-node-label">{data.label}</div>
        <div className="sub-node-name-en">{data.nameEn}</div>
        <div className="sub-node-desc">
          {data.description && data.description.length > 90
            ? data.description.slice(0, 87) + '\u2026'
            : data.description}
        </div>
        <div className="sub-node-meta">
          <span className="sub-node-count">{data.paperCount} papers</span>
          <span className="sub-node-enter">ENTER {'\u25B6'}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ opacity: 0 }} />
    </div>
  );
}

export default memo(SubdomainNode);
