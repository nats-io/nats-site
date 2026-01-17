import { useEffect, useState } from "react";
import {
    Background,
    MarkerType,
    ReactFlow,
    ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { PublisherNode, ServerNode, SubscriberNode } from "../nodes";
import { AnimatedEdge } from "../edges";

const nodeTypes = {
    publisher: PublisherNode,
    subscriber: SubscriberNode,
    server: ServerNode,
};

const edgeTypes = {
    animated: AnimatedEdge,
};

/**
 * Publish-Subscribe animated scenario showing progressive subscriber addition.
 * Cycles through: no subscribers → 1 subscriber → 3 subscribers
 * Demonstrates how messages fan out to all active subscribers.
 */
function PublishSubscribeAnimatedInner({
    width = 600,
    height = 350,
}: {
    width?: number;
    height?: number;
}) {
    const [phase, setPhase] = useState<number>(0); // 0 = no subs, 1 = 1 sub, 2 = 3 subs

    // Cycle through phases: 0 → 1 → 2 → 0
    useEffect(() => {
        const interval = setInterval(() => {
            setPhase((prev) => (prev + 1) % 3);
        }, 4000); // 4 seconds per phase

        return () => clearInterval(interval);
    }, []);

    // Determine active subscribers based on phase
    const subscriber1Active = phase >= 1;
    const subscriber2Active = phase >= 2;
    const subscriber3Active = phase >= 2;

    // All nodes are always visible
    const nodes = [
        {
            id: "publisher",
            type: "publisher",
            position: { x: 0, y: 150 },
            data: { label: "Publisher" },
        },
        {
            id: "server",
            type: "server",
            position: { x: 200, y: 150 },
            data: { label: "NATS" },
        },
        {
            id: "subscriber-1",
            type: "subscriber",
            position: { x: 400, y: 150 },
            data: { label: "Subscriber 1" },
            style: {
                opacity: subscriber1Active ? 1 : 0.3,
            },
        },
        {
            id: "subscriber-2",
            type: "subscriber",
            position: { x: 400, y: 50 },
            data: { label: "Subscriber 2" },
            style: {
                opacity: subscriber2Active ? 1 : 0.3,
            },
        },
        {
            id: "subscriber-3",
            type: "subscriber",
            position: { x: 400, y: 250 },
            data: { label: "Subscriber 3" },
            style: {
                opacity: subscriber3Active ? 1 : 0.3,
            },
        },
    ];

    // Base edge: publisher → server (always animated)
    const edges: any[] = [
        {
            id: "e-publisher-server",
            source: "publisher",
            target: "server",
            type: "animated",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
                color: "#3b82f6",
                animated: true,
                label: "updates",
            },
        },
    ];

    // Add edges to active subscribers
    if (subscriber1Active) {
        edges.push({
            id: "e-server-sub1",
            source: "server",
            target: "subscriber-1",
            type: "animated",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
                color: "#3b82f6",
                animated: true,
                delay: 1500,
                label: "updates",
            },
        });
    }

    if (subscriber2Active) {
        edges.push({
            id: "e-server-sub2",
            source: "server",
            target: "subscriber-2",
            type: "animated",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
                color: "#3b82f6",
                animated: true,
                delay: 1500,
                label: "updates",
            },
        });
    }

    if (subscriber3Active) {
        edges.push({
            id: "e-server-sub3",
            source: "server",
            target: "subscriber-3",
            type: "animated",
            animated: true,
            markerEnd: { type: MarkerType.ArrowClosed },
            data: {
                color: "#3b82f6",
                animated: true,
                delay: 1500,
                label: "updates",
            },
        });
    }

    return (
        <div
            style={{
                width: `${width}px`,
                height: `${height}px`,
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                overflow: "hidden",
                position: "relative",
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
    );
}

// Wrapper component that provides ReactFlow context
export function PublishSubscribeAnimated(
    props: { width?: number; height?: number },
) {
    return (
        <ReactFlowProvider>
            <PublishSubscribeAnimatedInner {...props} />
        </ReactFlowProvider>
    );
}
