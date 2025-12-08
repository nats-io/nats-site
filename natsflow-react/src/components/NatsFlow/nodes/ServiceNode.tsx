import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../../../types';

export function ServiceNode({ data, selected }: NodeProps) {
  const nodeData = data as NatsNodeData;
  return (
    <BaseNode selected={selected}>
      <div className="flex flex-col items-center gap-1">
        <NatsIcon width={24} height={24} />
        <div className="font-semibold text-gray-800">{nodeData.label}</div>
        <div className="text-xs text-gray-500">Service</div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="request"
        className="!h-3 !w-3 !bg-orange-500"
        style={{ top: '30%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="reply"
        className="!h-3 !w-3 !bg-green-500"
        style={{ top: '70%' }}
      />
    </BaseNode>
  );
}

ServiceNode.displayName = 'ServiceNode';
