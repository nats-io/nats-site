import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BaseNode } from './BaseNode';
import { NatsIcon } from '../icons/NatsIcon';
import type { NatsNodeData } from '../types';

export function ServerNode({ data, selected }: NodeProps) {
  const nodeData = data as NatsNodeData;
  return (
    <BaseNode selected={selected}>
      <div className="flex flex-col items-center gap-1">
        <NatsIcon width={32} height={32} />
        <div className="font-semibold text-gray-800">{nodeData.label}</div>
        <div className="text-xs text-gray-500">Server</div>
      </div>
      {/* Default handles for pub-sub */}
      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !bg-blue-500"
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
    </BaseNode>
  );
}

ServerNode.displayName = 'ServerNode';
