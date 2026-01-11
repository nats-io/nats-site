import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const queueGroupScenario: NatsFlowScenario = {
  description: 'Queue group pattern for load balancing where messages are distributed among queue subscribers',
  nodes: [
    {
      id: 'publisher',
      type: 'publisher',
      position: { x: 50, y: 150 },
      data: { label: 'Publisher' },
    },
    {
      id: 'queue-1',
      type: 'subscriber',
      position: { x: 350, y: 50 },
      data: { label: 'Queue Worker 1', type: 'queue' },
    },
    {
      id: 'queue-2',
      type: 'subscriber',
      position: { x: 350, y: 150 },
      data: { label: 'Queue Worker 2', type: 'queue' },
    },
    {
      id: 'queue-3',
      type: 'subscriber',
      position: { x: 350, y: 250 },
      data: { label: 'Queue Worker 3', type: 'queue' },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'publisher',
      target: 'queue-1',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#8b5cf6', animated: true, label: 'work.queue' },
    },
    {
      id: 'e2',
      source: 'publisher',
      target: 'queue-2',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#8b5cf6', animated: true },
    },
    {
      id: 'e3',
      source: 'publisher',
      target: 'queue-3',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#8b5cf6', animated: true },
    },
  ],
};
