import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../types';

export function PublisherNode({ data, selected }: NodeProps) {
  const nodeData = data as NatsNodeData;
  return (
    <BaseNode selected={selected}>
      <div className="flex flex-col items-center gap-1">
        <NatsIcon width={24} height={24} />
        <div className="font-semibold text-gray-800">{nodeData.label}</div>
      </div>
      {/* Default handle for publish scenarios */}
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-blue-500"
      />
      {/* Request handle for request-reply scenarios (top) - hidden but functional */}
      <Handle
        type="source"
        position={Position.Right}
        id="request"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ top: '30%', opacity: 0 }}
      />
      {/* Reply handle for request-reply scenarios (bottom) - hidden but functional */}
      <Handle
        type="target"
        position={Position.Right}
        id="reply"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ top: '70%', opacity: 0 }}
      />
    </BaseNode>
  );
}

PublisherNode.displayName = 'PublisherNode';
