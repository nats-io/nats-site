import { useState, useEffect } from 'react';
import { MarkerType, ReactFlow, Background, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { PublisherNode, SubscriberNode } from '../nodes';
import { AnimatedEdge } from '../edges';

const nodeTypes = {
  publisher: PublisherNode,
  subscriber: SubscriberNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

/**
 * Queue group scenario showing proper load balancing behavior.
 * Messages are delivered to only ONE worker at a time (randomly selected),
 * demonstrating how queue groups distribute load across subscribers.
 */
function QueueGroupAnimatedInner({
  width = 600,
  height = 350,
}: {
  width?: number;
  height?: number;
}) {
  const [activeWorker, setActiveWorker] = useState<number>(0);

  // Rotate through workers to simulate load balancing
  // In real NATS, selection is random, but we'll cycle for demonstration
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWorker((prev) => (prev + 1) % 3);
    }, 2000); // Change every 2 seconds to match message frequency

    return () => clearInterval(interval);
  }, []);

  // All nodes are always visible at full opacity (all subscribed)
  const nodes = [
    {
      id: 'publisher',
      type: 'publisher',
      position: { x: 0, y: 150 },
      data: { label: 'Publisher' },
    },
    {
      id: 'worker-1',
      type: 'subscriber',
      position: { x: 400, y: 50 },
      data: { label: 'Worker 1' },
    },
    {
      id: 'worker-2',
      type: 'subscriber',
      position: { x: 400, y: 150 },
      data: { label: 'Worker 2' },
    },
    {
      id: 'worker-3',
      type: 'subscriber',
      position: { x: 400, y: 250 },
      data: { label: 'Worker 3' },
    },
  ];

  // All edges (connections) are always visible - workers are always subscribed
  // But only ONE edge gets animated dots at a time (showing message delivery)
  const edges: any[] = [
    {
      id: 'e-worker-1',
      source: 'publisher',
      target: 'worker-1',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#8b5cf6',
        animated: activeWorker === 0, // Only animate if this worker is selected
      },
    },
    {
      id: 'e-worker-2',
      source: 'publisher',
      target: 'worker-2',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#8b5cf6',
        animated: activeWorker === 1, // Only animate if this worker is selected
      },
    },
    {
      id: 'e-worker-3',
      source: 'publisher',
      target: 'worker-3',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#8b5cf6',
        animated: activeWorker === 2, // Only animate if this worker is selected
      },
    },
  ];

  return (
    <div style={{ position: 'relative' }}>
      {/* Info text */}
      <div
        style={{
          marginBottom: '12px',
          fontSize: '13px',
          color: '#6b7280',
          fontStyle: 'italic',
        }}
      >
        All workers are subscribed. Watch as each message (dot) flows to only ONE worker at a time.
      </div>

      {/* Flow diagram */}
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
          nodes={nodes}
          edges={edges}
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
        </ReactFlow>
      </div>

      {/* Status indicator */}
      <div
        style={{
          marginTop: '8px',
          fontSize: '13px',
          color: '#6b7280',
        }}
      >
        Current message routing to: <strong>Worker {activeWorker + 1}</strong> (NATS randomly selects one worker per message)
      </div>
    </div>
  );
}

// Wrapper component that provides ReactFlow context
export function QueueGroupAnimated(props: { width?: number; height?: number }) {
  return (
    <ReactFlowProvider>
      <QueueGroupAnimatedInner {...props} />
    </ReactFlowProvider>
  );
}
