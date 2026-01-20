import { useState } from 'react';
import { MarkerType, ReactFlow, Background, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type { NatsFlowScenario } from '../types';
import { PublisherNode, SubscriberNode, ServerNode } from '../nodes';
import { AnimatedEdge } from '../edges';

const nodeTypes = {
  publisher: PublisherNode,
  subscriber: SubscriberNode,
  server: ServerNode,
};

const edgeTypes = {
  animated: AnimatedEdge,
};

/**
 * Interactive scenario that demonstrates publish-subscribe with toggleable subscriptions.
 * A publisher continuously sends messages on subject 'foo', and two subscriber clients
 * are always visible but only receive messages when subscribed to the subject.
 * This illustrates that subscribers can exist without being connected to a subject.
 */
function ToggleableSubscribersScenarioInner({
  width = 600,
  height = 350,
}: {
  width?: number;
  height?: number;
}) {
  const [subscriber1Active, setSubscriber1Active] = useState(false);
  const [subscriber2Active, setSubscriber2Active] = useState(false);

  // All nodes are always visible - subscribers just aren't connected until enabled
  const nodes = [
    {
      id: 'publisher',
      type: 'publisher',
      position: { x: 0, y: 150 },
      data: { label: 'Publisher' },
    },
    {
      id: 'server',
      type: 'server',
      position: { x: 200, y: 150 },
      data: { label: 'NATS' },
    },
    {
      id: 'subscriber-1',
      type: 'subscriber',
      position: { x: 400, y: 100 },
      data: { label: 'Subscriber 1' },
      style: {
        opacity: subscriber1Active ? 1 : 0.4,
      },
    },
    {
      id: 'subscriber-2',
      type: 'subscriber',
      position: { x: 400, y: 200 },
      data: { label: 'Subscriber 2' },
      style: {
        opacity: subscriber2Active ? 1 : 0.4,
      },
    },
  ];

  // Build edges array dynamically
  const edges: any[] = [
    {
      id: 'e-pub-server',
      source: 'publisher',
      target: 'server',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, label: 'foo' },
    },
  ];

  // Add edges to active subscribers with delay so animation flows sequentially
  if (subscriber1Active) {
    edges.push({
      id: 'e-server-sub1',
      source: 'server',
      target: 'subscriber-1',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, delay: 1500 }, // Wait for publisher->server animation
    });
  }

  if (subscriber2Active) {
    edges.push({
      id: 'e-server-sub2',
      source: 'server',
      target: 'subscriber-2',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, delay: 1500 }, // Wait for publisher->server animation
    });
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Control buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '14px', fontWeight: 500, marginRight: '8px' }}>
          Controls:
        </span>
        <button
          onClick={() => setSubscriber1Active(!subscriber1Active)}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: subscriber1Active ? '#10b981' : '#6b7280',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {subscriber1Active ? 'Unsubscribe' : 'Subscribe'} Subscriber 1
        </button>
        <button
          onClick={() => setSubscriber2Active(!subscriber2Active)}
          style={{
            padding: '6px 12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#fff',
            backgroundColor: subscriber2Active ? '#10b981' : '#6b7280',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          {subscriber2Active ? 'Unsubscribe' : 'Subscribe'} Subscriber 2
        </button>
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
        Subscribed: {[subscriber1Active, subscriber2Active].filter(Boolean).length} / 2
        {!subscriber1Active && !subscriber2Active && (
          <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>
            (Subscribe to see message flow)
          </span>
        )}
      </div>
    </div>
  );
}

// Wrapper component that provides ReactFlow context
export function ToggleableSubscribersScenario(props: { width?: number; height?: number }) {
  return (
    <ReactFlowProvider>
      <ToggleableSubscribersScenarioInner {...props} />
    </ReactFlowProvider>
  );
}

// Also export a static version for the loader
export const toggleableSubscribersScenario: NatsFlowScenario = {
  description: 'Interactive publish-subscribe with toggleable subscribers on subject "foo"',
  nodes: [
    {
      id: 'publisher',
      type: 'publisher',
      position: { x: 0, y: 150 },
      data: { label: 'Publisher' },
    },
    {
      id: 'server',
      type: 'server',
      position: { x: 200, y: 150 },
      data: { label: 'NATS' },
    },
    {
      id: 'subscriber-1',
      type: 'subscriber',
      position: { x: 400, y: 100 },
      data: { label: 'Subscriber 1' },
    },
    {
      id: 'subscriber-2',
      type: 'subscriber',
      position: { x: 400, y: 200 },
      data: { label: 'Subscriber 2' },
    },
  ],
  edges: [
    {
      id: 'e-pub-server',
      source: 'publisher',
      target: 'server',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, label: 'foo' },
    },
    {
      id: 'e-server-sub1',
      source: 'server',
      target: 'subscriber-1',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, delay: 1500 },
    },
    {
      id: 'e-server-sub2',
      source: 'server',
      target: 'subscriber-2',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, delay: 1500 },
    },
  ],
};
