import { MarkerType, ReactFlow, Background, ReactFlowProvider } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
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
 * Wildcard comparison showing * vs > patterns
 * Shows:
 * - Three publishers sending to subjects with different depths
 * - Two subscribers: one with * wildcard, one with > wildcard
 * - Clear visualization of what each wildcard pattern matches
 */
function WildcardComparisonInner({
  width = 800,
  height = 500,
}: {
  width?: number;
  height?: number;
}) {
  const nodes = [
    // Three publishers with different subject depths
    {
      id: 'publisher-1',
      type: 'publisher',
      position: { x: 0, y: 50 },
      data: { label: 'Pub 1' },
    },
    {
      id: 'publisher-2',
      type: 'publisher',
      position: { x: 0, y: 200 },
      data: { label: 'Pub 2' },
    },
    {
      id: 'publisher-3',
      type: 'publisher',
      position: { x: 0, y: 350 },
      data: { label: 'Pub 3' },
    },
    // NATS server in the middle
    {
      id: 'server',
      type: 'server',
      position: { x: 300, y: 200 },
      data: { label: 'NATS' },
    },
    // Two subscribers with different wildcard patterns
    {
      id: 'subscriber-star',
      type: 'subscriber',
      position: { x: 600, y: 100 },
      data: { label: 'Sub: weather.*.east' },
    },
    {
      id: 'subscriber-gt',
      type: 'subscriber',
      position: { x: 600, y: 300 },
      data: { label: 'Sub: weather.>' },
    },
  ];

  // Publishers to server
  const edges: any[] = [
    // Publisher 1: weather.us.east (2 levels)
    {
      id: 'e-pub1-server',
      source: 'publisher-1',
      target: 'server',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981', // Green
        animated: true,
        label: 'weather.us.east',
        delay: 0,
        interval: 15000,
      },
    },
    // Publisher 2: weather.eu.east (2 levels)
    {
      id: 'e-pub2-server',
      source: 'publisher-2',
      target: 'server',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6', // Blue
        animated: true,
        label: 'weather.eu.east',
        delay: 4000,
        interval: 15000,
      },
    },
    // Publisher 3: weather.us.east.boston (3 levels - only matches >)
    {
      id: 'e-pub3-server',
      source: 'publisher-3',
      target: 'server',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f59e0b', // Orange
        animated: true,
        label: 'weather.us.east.boston',
        delay: 8000,
        interval: 15000,
      },
    },

    // Server to subscriber with * wildcard
    // Matches pub1 and pub2 (exactly 3 tokens)
    {
      id: 'e-server-star-1',
      source: 'server',
      target: 'subscriber-star',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981', // Green (from pub1)
        animated: true,
        delay: 1500,
        interval: 15000,
      },
    },
    {
      id: 'e-server-star-2',
      source: 'server',
      target: 'subscriber-star',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6', // Blue (from pub2)
        animated: true,
        delay: 5500,
        interval: 15000,
      },
    },

    // Server to subscriber with > wildcard
    // Matches all three publishers
    {
      id: 'e-server-gt-1',
      source: 'server',
      target: 'subscriber-gt',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981', // Green (from pub1)
        animated: true,
        delay: 1500,
        interval: 15000,
      },
    },
    {
      id: 'e-server-gt-2',
      source: 'server',
      target: 'subscriber-gt',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6', // Blue (from pub2)
        animated: true,
        delay: 5500,
        interval: 15000,
      },
    },
    {
      id: 'e-server-gt-3',
      source: 'server',
      target: 'subscriber-gt',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f59e0b', // Orange (from pub3)
        animated: true,
        delay: 9500,
        interval: 15000,
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
        Comparing <code>*</code> (single token) vs <code>&gt;</code> (multiple tokens) wildcards
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

      {/* Pattern explanation */}
      <div
        style={{
          marginTop: '12px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}
      >
        {/* Single token wildcard explanation */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          <strong style={{ color: '#059669' }}>Pattern: weather.*.east</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#4b5563' }}>
            <li style={{ color: '#059669' }}>✓ weather.us.east</li>
            <li style={{ color: '#2563eb' }}>✓ weather.eu.east</li>
            <li style={{ color: '#9ca3af' }}>✗ weather.us.east.boston (too many tokens)</li>
          </ul>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
            The <code>*</code> matches exactly one token
          </div>
        </div>

        {/* Multi-token wildcard explanation */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '6px',
            fontSize: '13px',
          }}
        >
          <strong style={{ color: '#2563eb' }}>Pattern: weather.&gt;</strong>
          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#4b5563' }}>
            <li style={{ color: '#059669' }}>✓ weather.us.east</li>
            <li style={{ color: '#2563eb' }}>✓ weather.eu.east</li>
            <li style={{ color: '#f59e0b' }}>✓ weather.us.east.boston</li>
          </ul>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
            The <code>&gt;</code> matches one or more tokens
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component that provides ReactFlow context
export function WildcardComparison(props: { width?: number; height?: number }) {
  return (
    <ReactFlowProvider>
      <WildcardComparisonInner {...props} />
    </ReactFlowProvider>
  );
}
