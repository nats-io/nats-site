import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../types';

export function ServiceNode({ data, selected }: NodeProps) {
  const nodeData = data as NatsNodeData;
  return (
    <BaseNode selected={selected}>
      <div className="flex flex-col items-center gap-1">
        <NatsIcon width={24} height={24} />
        <div className="font-semibold text-gray-800">{nodeData.label}</div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="request"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ top: '30%', opacity: 0 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="reply"
        className="!h-3 !w-3 !bg-blue-500"
        style={{ top: '70%', opacity: 0 }}
      />
    </BaseNode>
  );
}

ServiceNode.displayName = 'ServiceNode';
