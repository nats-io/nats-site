import { type NodeProps } from '@xyflow/react';

interface GroupNodeData {
  label?: string;
  width?: number;
  height?: number;
  showBorder?: boolean;
}

export function GroupNode({ data }: NodeProps) {
  const nodeData = data as GroupNodeData;
  const width = nodeData.width || 300;
  const height = nodeData.height || 150;
  const showBorder = nodeData.showBorder !== false; // default true

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: showBorder ? '2px dashed #9ca3af' : 'none',
        borderRadius: showBorder ? '8px' : '0',
        backgroundColor: 'transparent',
        position: 'relative',
      }}
    >
      {nodeData.label && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {nodeData.label}
        </div>
      )}
    </div>
  );
}

GroupNode.displayName = 'GroupNode';
