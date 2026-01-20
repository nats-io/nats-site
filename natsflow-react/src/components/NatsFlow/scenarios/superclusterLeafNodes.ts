import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const superclusterLeafNodesScenario: NatsFlowScenario = {
  description: 'Supercluster with two regional clusters (East/West) and four leaf nodes',
  nodes: [
    // Cloud container (dotted rectangle around clusters)
    {
      id: 'cloud-container',
      type: 'container',
      position: { x: 25, y: 75 },
      data: { label: 'Cloud', width: 420, height: 160 },
    },
    // West Cluster (trio of servers in circle)
    {
      id: 'east-cluster',
      type: 'cluster',
      position: { x: 50, y: 100 },
      data: { label: 'West' },
    },
    // East Cluster (trio of servers in circle)
    {
      id: 'west-cluster',
      type: 'cluster',
      position: { x: 320, y: 100 },
      data: { label: 'East' },
    },
    // Faded leaf nodes stacked behind main nodes to imply scale (rendered first = behind)
    // Behind Leaf 1 (above East)
    {
      id: 'leaf-faded-1b',
      type: 'server',
      position: { x: 54, y: -34 },
      data: { label: '', subtitle: '', labelPosition: 'left', opacity: 0.15 },
    },
    {
      id: 'leaf-faded-1a',
      type: 'server',
      position: { x: 62, y: -42 },
      data: { label: '', subtitle: '', labelPosition: 'left', opacity: 0.3 },
    },
    // Behind Leaf 2 (below East)
    {
      id: 'leaf-faded-2b',
      type: 'server',
      position: { x: 54, y: 296 },
      data: { label: '', subtitle: '', labelPosition: 'left', opacity: 0.15 },
    },
    {
      id: 'leaf-faded-2a',
      type: 'server',
      position: { x: 62, y: 288 },
      data: { label: '', subtitle: '', labelPosition: 'left', opacity: 0.3 },
    },
    // Behind Leaf 3 (above West)
    {
      id: 'leaf-faded-3b',
      type: 'server',
      position: { x: 356, y: -34 },
      data: { label: '', subtitle: '', labelPosition: 'right', opacity: 0.15 },
    },
    {
      id: 'leaf-faded-3a',
      type: 'server',
      position: { x: 348, y: -42 },
      data: { label: '', subtitle: '', labelPosition: 'right', opacity: 0.3 },
    },
    // Behind Leaf 4 (below West)
    {
      id: 'leaf-faded-4b',
      type: 'server',
      position: { x: 356, y: 296 },
      data: { label: '', subtitle: '', labelPosition: 'right', opacity: 0.15 },
    },
    {
      id: 'leaf-faded-4a',
      type: 'server',
      position: { x: 348, y: 288 },
      data: { label: '', subtitle: '', labelPosition: 'right', opacity: 0.3 },
    },
    // Main Leaf Nodes (rendered last = on top)
    // Leaf Node 1 - above East cluster
    {
      id: 'leaf-1',
      type: 'server',
      position: { x: 70, y: -50 },
      data: { label: 'Leaf Nodes & Clients', subtitle: '', labelPosition: 'left' },
    },
    // Leaf Node 2 - below East cluster
    {
      id: 'leaf-2',
      type: 'server',
      position: { x: 70, y: 280 },
      data: { label: 'Leaf Nodes & Clients', subtitle: '', labelPosition: 'left' },
    },
    // Leaf Node 3 - above West cluster
    {
      id: 'leaf-3',
      type: 'server',
      position: { x: 340, y: -50 },
      data: { label: 'Leaf Nodes & Clients', subtitle: '', labelPosition: 'right' },
    },
    // Leaf Node 4 - below West cluster
    {
      id: 'leaf-4',
      type: 'server',
      position: { x: 340, y: 280 },
      data: { label: 'Leaf Nodes & Clients', subtitle: '', labelPosition: 'right' },
    },
  ],
  edges: [
    // Supercluster connection between East and West
    {
      id: 'east-west',
      source: 'east-cluster',
      target: 'west-cluster',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      markerStart: { type: MarkerType.ArrowClosed },
      data: {
        color: '#8b5cf6',
        animated: true,
        interval: 3000,
        label: 'Gateway Routes',
        labelColor: '#8b5cf6',
        bidirectional: true,
      },
    },
    // Leaf 1 (above East) to East cluster
    {
      id: 'leaf1-east',
      source: 'leaf-1',
      target: 'east-cluster',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6',
        animated: true,
        delay: 0,
        interval: 4000,
      },
    },
    // East cluster to Leaf 2 (below East)
    {
      id: 'east-leaf2',
      source: 'east-cluster',
      target: 'leaf-2',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6',
        animated: true,
        delay: 1000,
        interval: 4000,
      },
    },
    // Leaf 3 (above West) to West cluster
    {
      id: 'leaf3-west',
      source: 'leaf-3',
      target: 'west-cluster',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6',
        animated: true,
        delay: 2000,
        interval: 4000,
      },
    },
    // West cluster to Leaf 4 (below West)
    {
      id: 'west-leaf4',
      source: 'west-cluster',
      target: 'leaf-4',
      sourceHandle: 'bottom',
      targetHandle: 'top',
      type: 'animated',
      markerEnd: { type: MarkerType.ArrowClosed },
      data: {
        color: '#3b82f6',
        animated: true,
        delay: 3000,
        interval: 4000,
      },
    },
  ],
};
