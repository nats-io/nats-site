import type { Node, Edge } from '@xyflow/react';

export interface NatsFlowScenario {
  nodes: Node[];
  edges: Edge[];
  description?: string;
}

export interface NatsFlowProps {
  scenario: NatsFlowScenario;
  width?: number;
  height?: number;
  showControls?: boolean;
  autoPlay?: boolean;
  animationSpeed?: number;
}

export type AnimatedEdgeData = {
  color?: string;
  size?: number;
  label?: string;
  throughput?: number;
  animated?: boolean;
};

export type NatsNodeData = {
  label: string;
  type?: 'publisher' | 'subscriber' | 'service' | 'queue';
  status?: 'active' | 'inactive' | 'processing';
};