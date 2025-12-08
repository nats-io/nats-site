import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../../../types';

export const publishSubscribeScenario: NatsFlowScenario = {
  description: 'Basic publish-subscribe pattern where messages flow through the NATS server to multiple subscribers',
  nodes: [
    {
      id: 'publisher',
      type: 'publisher',
      position: { x: 50, y: 150 },
      data: { label: 'App 1' },
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
      data: { label: 'App 2' },
    },
    {
      id: 'subscriber-2',
      type: 'subscriber',
      position: { x: 450, y: 150 },
      data: { label: 'App 3' },
    },
    {
      id: 'subscriber-3',
      type: 'subscriber',
      position: { x: 450, y: 250 },
      data: { label: 'App 4' },
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
      data: { color: '#3b82f6', animated: true, label: 'events.data' },
    },
    {
      id: 'e-server-sub1',
      source: 'server',
      target: 'subscriber-1',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true },
    },
    {
      id: 'e-server-sub2',
      source: 'server',
      target: 'subscriber-2',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true },
    },
    {
      id: 'e-server-sub3',
      source: 'server',
      target: 'subscriber-3',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true },
    },
  ],
};