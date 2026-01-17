import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../types';

export function ServerNode({ data, selected }: NodeProps) {
  const nodeData = data as NatsNodeData;
  const labelPosition = nodeData.labelPosition || 'center';
  const opacity = nodeData.opacity !== undefined ? nodeData.opacity : 1;

  const subtitle = nodeData.subtitle !== undefined ? nodeData.subtitle : 'Server';

  // Handles component (reused in both layouts)
  const handles = (
    <>
      {/* Default handles for pub-sub - invisible */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0 }}
      />
      {/* Request-reply handles - hidden but functional */}
      <Handle
        type="target"
        position={Position.Left}
        id="request-in"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="request-out"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="reply-in"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="reply-out"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ opacity: 0 }}
      />
      {/* Top/bottom handles for vertical connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0 }}
      />
    </>
  );

  // Simple layout without box for external labels
  if (labelPosition !== 'center') {
    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', opacity }}>
        <NatsIcon width={40} height={40} />
        <div
          style={{
            position: 'absolute',
            [labelPosition === 'left' ? 'right' : 'left']: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            [labelPosition === 'left' ? 'paddingRight' : 'paddingLeft']: '16px',
            width: '90px',
            textAlign: labelPosition === 'left' ? 'right' : 'left',
          }}
        >
          <div className="font-semibold text-gray-800" style={{ lineHeight: '1.2' }}>{nodeData.label}</div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        {handles}
      </div>
    );
  }

  // Standard layout with box for center labels
  return (
    <BaseNode selected={selected}>
      <div className="flex flex-col items-center gap-1">
        <NatsIcon width={32} height={32} />
        <div className="font-semibold text-gray-800">{nodeData.label}</div>
        {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
      </div>
      {handles}
    </BaseNode>
  );
}

ServerNode.displayName = 'ServerNode';
