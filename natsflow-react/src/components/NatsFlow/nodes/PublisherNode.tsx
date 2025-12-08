import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../../../types';

export function PublisherNode({ data, selected }: NodeProps) {
  const nodeData = data as NatsNodeData;
  return (
    <BaseNode selected={selected}>
      <div className="flex flex-col items-center gap-1">
        <NatsIcon width={24} height={24} />
        <div className="font-semibold text-gray-800">{nodeData.label}</div>
        <div className="text-xs text-gray-500">Publisher</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-blue-500"
      />
    </BaseNode>
  );
}

PublisherNode.displayName = 'PublisherNode';
