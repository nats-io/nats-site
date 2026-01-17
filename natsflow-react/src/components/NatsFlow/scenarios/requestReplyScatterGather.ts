import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const requestReplyScatterGatherScenario: NatsFlowScenario = {
  description: 'Request to multiple services - all respond (scatter-gather pattern)',
  nodes: [
    {
      id: 'client',
      type: 'publisher',
      position: { x: 50, y: 200 },
      data: { label: 'Client' },
    },
    {
      id: 'server',
      type: 'server',
      position: { x: 350, y: 200 },
      data: { label: 'NATS' },
    },
    {
      id: 'service-1',
      type: 'service',
      position: { x: 650, y: 80 },
      data: { label: 'Service A' },
    },
    {
      id: 'service-2',
      type: 'service',
      position: { x: 650, y: 200 },
      data: { label: 'Service B' },
    },
    {
      id: 'service-3',
      type: 'service',
      position: { x: 650, y: 320 },
      data: { label: 'Service C' },
    },
  ],
  edges: [
    // Request: Client -> NATS
    {
      id: 'request-client-server',
      source: 'client',
      target: 'server',
      sourceHandle: 'request',
      targetHandle: 'request-in',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f97316',
        animated: true,
        label: 'get.status',
        labelOffset: -20,
        labelColor: '#f97316',
        delay: 0,
        interval: 9000,
      },
    },
    // Request: NATS -> Service A
    {
      id: 'request-server-service-1',
      source: 'server',
      target: 'service-1',
      sourceHandle: 'request-out',
      targetHandle: 'request',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f97316',
        animated: true,
        delay: 1500,
        interval: 9000,
      },
    },
    // Request: NATS -> Service B
    {
      id: 'request-server-service-2',
      source: 'server',
      target: 'service-2',
      sourceHandle: 'request-out',
      targetHandle: 'request',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f97316',
        animated: true,
        delay: 1500,
        interval: 9000,
      },
    },
    // Request: NATS -> Service C
    {
      id: 'request-server-service-3',
      source: 'server',
      target: 'service-3',
      sourceHandle: 'request-out',
      targetHandle: 'request',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f97316',
        animated: true,
        delay: 1500,
        interval: 9000,
      },
    },
    // Reply: Service A -> NATS
    {
      id: 'reply-service-1-server',
      source: 'service-1',
      target: 'server',
      sourceHandle: 'reply',
      targetHandle: 'reply-in',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981',
        animated: true,
        delay: 3000,
        interval: 9000,
      },
      style: { strokeDasharray: '5,5' },
    },
    // Reply: Service B -> NATS
    {
      id: 'reply-service-2-server',
      source: 'service-2',
      target: 'server',
      sourceHandle: 'reply',
      targetHandle: 'reply-in',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981',
        animated: true,
        delay: 3000,
        interval: 9000,
      },
      style: { strokeDasharray: '5,5' },
    },
    // Reply: Service C -> NATS
    {
      id: 'reply-service-3-server',
      source: 'service-3',
      target: 'server',
      sourceHandle: 'reply',
      targetHandle: 'reply-in',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981',
        animated: true,
        delay: 3000,
        interval: 9000,
      },
      style: { strokeDasharray: '5,5' },
    },
    // Reply: NATS -> Client (all three responses)
    {
      id: 'reply-server-client',
      source: 'server',
      target: 'client',
      sourceHandle: 'reply-out',
      targetHandle: 'reply',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981',
        animated: true,
        label: '3 replies',
        labelOffset: 20,
        labelColor: '#10b981',
        delay: 4500,
        interval: 9000,
      },
      style: { strokeDasharray: '5,5' },
    },
  ],
};
