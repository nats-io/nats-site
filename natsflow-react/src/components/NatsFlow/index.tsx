import { useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { PublisherNode, SubscriberNode, ServiceNode, ServerNode } from './nodes';
import { AnimatedEdge } from './edges';
import type { NatsFlowProps } from '../../types';

const nodeTypes: NodeTypes = {
  publisher: PublisherNode,
  subscriber: SubscriberNode,
  service: ServiceNode,
  server: ServerNode,
};

const edgeTypes: EdgeTypes = {
  animated: AnimatedEdge,
};

// Suppress ResizeObserver errors (common with React Flow)
const suppressResizeObserverError = () => {
  const resizeObserverErrHandler = (e: ErrorEvent) => {
    const resizeObserverErrDiv = e.message?.includes('ResizeObserver');
    if (resizeObserverErrDiv) {
      const IGNORE_RESIZE_OBSERVER = true;
      if (IGNORE_RESIZE_OBSERVER) {
        e.stopImmediatePropagation();
        e.preventDefault();
        return false;
      }
    }
  };

  window.addEventListener('error', resizeObserverErrHandler);

  // Also override console.error to filter ResizeObserver warnings
  const originalError = console.error;
  console.error = (...args: any[]) => {
    const msg = args[0]?.toString() || '';
    if (msg.includes('ResizeObserver')) {
      return;
    }
    originalError.apply(console, args);
  };

  return () => {
    window.removeEventListener('error', resizeObserverErrHandler);
    console.error = originalError;
  };
};

export function NatsFlow({
  scenario,
  width = 600,
  height = 400,
  showControls = false,
}: NatsFlowProps) {
  useEffect(() => {
    return suppressResizeObserverError();
  }, []);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ReactFlow
        nodes={scenario.nodes}
        edges={scenario.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        preventScrolling={true}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background />
        {showControls && <Controls showInteractive={false} />}
      </ReactFlow>
    </div>
  );
}

NatsFlow.displayName = 'NatsFlow';