import { useEffect, useRef, useState } from 'react';
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from '@xyflow/react';
import type { AnimatedEdgeData } from '../types';

interface Circle {
  id: number;
  progress: number;
  isActive: boolean;
  startTime: number;
}

const getPositionAlongPath = (path: string, progress: number) => {
  const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathElement.setAttribute('d', path);
  const length = pathElement.getTotalLength();
  const point = pathElement.getPointAtLength(length * progress);
  return point;
};

export function AnimatedEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    markerStart,
    data,
  } = props;

  const [circles, setCircles] = useState<Circle[]>([]);
  const nextId = useRef<number>(0);
  const animationRef = useRef<number | undefined>(undefined);

  const edgeData = data as AnimatedEdgeData;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Add a circle every interval (default 2 seconds) if animated
  useEffect(() => {
    if (!edgeData?.animated) return;

    const delay = edgeData?.delay || 0;
    const repeatInterval = edgeData?.interval || 2000;
    let interval: NodeJS.Timeout | undefined;

    // Wait for the delay before starting the animation
    const delayTimeout = setTimeout(() => {
      // Add the first circle immediately after delay
      const newCircle: Circle = {
        id: nextId.current++,
        progress: 0,
        isActive: true,
        startTime: Date.now(),
      };
      setCircles((prev) => [...prev, newCircle]);

      // Then add a circle every repeatInterval milliseconds
      interval = setInterval(() => {
        const newCircle: Circle = {
          id: nextId.current++,
          progress: 0,
          isActive: true,
          startTime: Date.now(),
        };
        setCircles((prev) => [...prev, newCircle]);
      }, repeatInterval);
    }, delay);

    return () => {
      clearTimeout(delayTimeout);
      if (interval) clearInterval(interval);
    };
  }, [edgeData?.animated, edgeData?.delay, edgeData?.interval]);

  // Animation loop
  useEffect(() => {
    if (circles.length === 0) return;

    const animationDuration = 1500;

    const animate = () => {
      const currentTime = Date.now();

      setCircles((prevCircles) =>
        prevCircles
          .map((circle) => {
            const elapsedTime = currentTime - circle.startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);

            if (progress >= 1) {
              return { ...circle, isActive: false };
            }

            return { ...circle, progress };
          })
          .filter((circle) => circle.isActive)
      );

      if (circles.some((circle) => circle.isActive)) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [circles]);

  const color = edgeData?.color || '#3b82f6';
  const size = edgeData?.size || 5;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        markerStart={markerStart}
        style={{ stroke: color, strokeWidth: 2 }}
      />
      {edgeData?.label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY + (edgeData.labelOffset || -15)}px)`,
              background: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 500,
              color: edgeData.labelColor || '#666',
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            {edgeData.label}
          </div>
        </EdgeLabelRenderer>
      )}
      <g>
        {circles.map((circle) => {
          const position = getPositionAlongPath(edgePath, circle.progress);
          return (
            <circle
              key={circle.id}
              cx={position.x}
              cy={position.y}
              r={size}
              fill={color}
              opacity={0.8}
            />
          );
        })}
      </g>
    </>
  );
}

AnimatedEdge.displayName = 'AnimatedEdge';
