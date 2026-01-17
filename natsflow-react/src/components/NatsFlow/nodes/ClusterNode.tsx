import { Handle, Position, type NodeProps } from '@xyflow/react';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../types';

export function ClusterNode({ data }: NodeProps) {
  const nodeData = data as NatsNodeData;
  return (
    <div
      style={{
        padding: '10px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '108px',
        height: '108px',
      }}
    >
      {/* Three NATS icons in a triangle formation */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <NatsIcon width={22} height={22} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <NatsIcon width={22} height={22} />
          <NatsIcon width={22} height={22} />
        </div>
      </div>
      <div style={{
        fontWeight: 600,
        color: '#374151',
        fontSize: '12px',
        marginTop: '4px',
      }}>
        {nodeData.label}
      </div>

      {/* Handles - invisible but functional */}
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
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ opacity: 0 }}
      />
    </div>
  );
}

ClusterNode.displayName = 'ClusterNode';
