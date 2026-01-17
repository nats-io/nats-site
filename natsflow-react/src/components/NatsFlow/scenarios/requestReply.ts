import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const requestReplyScenario: NatsFlowScenario = {
  description: 'Request-reply pattern where a client sends a request and waits for a response from a service',
  nodes: [
    {
      id: 'client',
      type: 'publisher',
      position: { x: 50, y: 150 },
      data: { label: 'Client' },
    },
    {
      id: 'server',
      type: 'server',
      position: { x: 350, y: 150 },
      data: { label: 'NATS' },
    },
    {
      id: 'service',
      type: 'service',
      position: { x: 650, y: 150 },
      data: { label: 'Service' },
    },
  ],
  edges: [
    // Request: Client -> NATS (top path, curved upward)
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
        label: 'get.user.150',
        labelOffset: -20,
        labelColor: '#f97316',
        delay: 0,
        interval: 6000,
      },
      pathOptions: { offset: -40, curvature: 0.25 },
    },
    // Request: NATS -> Service (top path, curved upward)
    {
      id: 'request-server-service',
      source: 'server',
      target: 'service',
      sourceHandle: 'request-out',
      targetHandle: 'request',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#f97316',
        animated: true,
        label: 'get.user.150',
        labelOffset: -20,
        labelColor: '#f97316',
        delay: 1500,
        interval: 6000,
      },
      pathOptions: { offset: -40, curvature: 0.25 },
    },
    // Reply: Service -> NATS (bottom path, curved downward)
    {
      id: 'reply-service-server',
      source: 'service',
      target: 'server',
      sourceHandle: 'reply',
      targetHandle: 'reply-in',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#10b981',
        animated: true,
        label: '_INBOX.nuid',
        labelOffset: 20,
        labelColor: '#10b981',
        delay: 3000,
        interval: 6000,
      },
      style: { strokeDasharray: '5,5' },
      pathOptions: { offset: 40, curvature: 0.25 },
    },
    // Reply: NATS -> Client (bottom path, curved downward)
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
        label: '_INBOX.nuid',
        labelOffset: 20,
        labelColor: '#10b981',
        delay: 4500,
        interval: 6000,
      },
      style: { strokeDasharray: '5,5' },
      pathOptions: { offset: 40, curvature: 0.25 },
    },
  ],
};
