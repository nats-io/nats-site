import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const publishSubscribeScenario: NatsFlowScenario = {
  description: 'Basic publish-subscribe pattern where messages flow through the NATS server to multiple subscribers',
  nodes: [
    {
      id: 'publisher',
      type: 'publisher',
      position: { x: 50, y: 150 },
      data: { label: 'Publisher' },
    },
    {
      id: 'server',
      type: 'server',
      position: { x: 250, y: 150 },
      data: { label: 'NATS' },
    },
    {
      id: 'subscriber-1',
      type: 'subscriber',
      position: { x: 450, y: 50 },
      data: { label: 'Subscriber 1' },
    },
    {
      id: 'subscriber-2',
      type: 'subscriber',
      position: { x: 450, y: 150 },
      data: { label: 'Subscriber 2' },
    },
    {
      id: 'subscriber-3',
      type: 'subscriber',
      position: { x: 450, y: 250 },
      data: { label: 'Subscriber 3' },
    },
  ],
  edges: [
    {
      id: 'e-pub-server',
      source: 'publisher',
      target: 'server',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, label: 'events.data' },
    },
    {
      id: 'e-server-sub1',
      source: 'server',
      target: 'subscriber-1',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, label: 'events.data' },
    },
    {
      id: 'e-server-sub2',
      source: 'server',
      target: 'subscriber-2',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true, label: 'events.data' },
    },
    {
      id: 'e-server-sub3',
      source: 'server',
      target: 'subscriber-3',
      type: 'animated',
      style: { strokeDasharray: '5, 5' },
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#d1d5db', animated: false, label: 'other.data' },
    },
  ],
};
