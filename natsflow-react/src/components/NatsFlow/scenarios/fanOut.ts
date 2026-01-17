import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const fanOutScenario: NatsFlowScenario = {
  description: 'Fan-out pattern where a single message is broadcasted to multiple independent services',
  nodes: [
    {
      id: 'source',
      type: 'publisher',
      position: { x: 50, y: 200 },
      data: { label: 'Event Source' },
    },
    {
      id: 'analytics',
      type: 'subscriber',
      position: { x: 350, y: 50 },
      data: { label: 'Analytics' },
    },
    {
      id: 'logging',
      type: 'subscriber',
      position: { x: 350, y: 150 },
      data: { label: 'Logging' },
    },
    {
      id: 'monitoring',
      type: 'subscriber',
      position: { x: 350, y: 250 },
      data: { label: 'Monitoring' },
    },
    {
      id: 'notification',
      type: 'subscriber',
      position: { x: 350, y: 350 },
      data: { label: 'Notification' },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'source',
      target: 'analytics',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#06b6d4', animated: true, label: 'events.*' },
    },
    {
      id: 'e2',
      source: 'source',
      target: 'logging',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#06b6d4', animated: true },
    },
    {
      id: 'e3',
      source: 'source',
      target: 'monitoring',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#06b6d4', animated: true },
    },
    {
      id: 'e4',
      source: 'source',
      target: 'notification',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#06b6d4', animated: true },
    },
  ],
};
