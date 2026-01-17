# NatsFlow Component

Interactive flow diagrams for NATS messaging patterns, built with React Flow.

## Overview

NatsFlow provides animated, interactive visualizations of NATS messaging patterns directly in Markdown documentation files. No MDX required!

## Usage in Markdown

Simply add a `<div>` tag with the `nats-flow` class:

```html
<div class="nats-flow" data-scenario="publishSubscribe"></div>
```

### Available Scenarios

#### 1. Publish-Subscribe
Shows one-to-many messaging pattern.

```html
<div class="nats-flow" data-scenario="publishSubscribe"></div>
```

#### 2. Request-Reply
Shows request-response pattern with a service.

```html
<div class="nats-flow" data-scenario="requestReply"></div>
```

#### 3. Queue Groups
Shows load-balanced message distribution.

```html
<div class="nats-flow" data-scenario="queueGroup"></div>
```

#### 4. Fan-Out
Shows broadcasting to multiple independent services.

```html
<div class="nats-flow" data-scenario="fanOut"></div>
```

### Options

Customize the diagram with data attributes:

```html
<!-- Custom size -->
<div class="nats-flow"
     data-scenario="publishSubscribe"
     data-width="800"
     data-height="500">
</div>

<!-- Hide controls -->
<div class="nats-flow"
     data-scenario="requestReply"
     data-show-controls="false">
</div>
```

#### Available Options

- `data-scenario` (required): The scenario to display
  - `publishSubscribe`
  - `requestReply`
  - `queueGroup`
  - `fanOut`
- `data-width`: Width in pixels (default: 600)
- `data-height`: Height in pixels (default: 400)
- `data-show-controls`: Show zoom/pan controls (default: true)

## Architecture

### Component Structure

```
NatsFlow/
├── index.tsx              # Main NatsFlow component
├── types.ts               # TypeScript type definitions
├── README.md              # This file
├── nodes/                 # Custom node components
│   ├── BaseNode.tsx       # Styled base node
│   ├── PublisherNode.tsx  # Publisher node
│   ├── SubscriberNode.tsx # Subscriber node
│   └── ServiceNode.tsx    # Service/responder node
├── edges/                 # Custom edge components
│   └── AnimatedEdge.tsx   # Animated message flow
├── scenarios/             # Prebuilt scenarios
│   ├── publishSubscribe.ts
│   ├── requestReply.ts
│   ├── queueGroup.ts
│   └── fanOut.ts
├── hooks/                 # React hooks
│   └── useInterval.ts     # Interval hook
└── lib/                   # Utilities
    └── utils.ts           # Helper functions
```

### How It Works

1. **Markdown Files**: Documentation authors add `<div class="nats-flow">` tags
2. **JavaScript Loader** (`/static/js/nats-flow-loader.js`):
   - Scans the page for `.nats-flow` elements
   - Dynamically imports the React component
   - Renders the appropriate scenario into each container
3. **React Components**: Handle the visualization and animation

### Key Features

- Works in regular Markdown (`.md`) files
- Animated message flows
- Interactive (zoom/pan optional)
- Prebuilt NATS patterns
- Automatic initialization via MutationObserver (works with Docusaurus navigation)

## Adding New Scenarios

To create a custom scenario:

1. Create a new file in `scenarios/`, e.g., `myScenario.ts`:

```typescript
import { MarkerType } from '@xyflow/react';
import type { NatsFlowScenario } from '../types';

export const myScenario: NatsFlowScenario = {
  description: 'My custom pattern',
  nodes: [
    {
      id: 'node1',
      type: 'publisher',
      position: { x: 50, y: 150 },
      data: { label: 'My Publisher' },
    },
    // Add more nodes...
  ],
  edges: [
    {
      id: 'e1',
      source: 'node1',
      target: 'node2',
      type: 'animated',
      animated: true,
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { color: '#3b82f6', animated: true },
    },
    // Add more edges...
  ],
};
```

2. Export from `scenarios/index.ts`:

```typescript
export { myScenario } from './myScenario';
```

3. Update the loader (`/static/js/nats-flow-loader.js`) to include the new scenario:

```javascript
scenarios = {
  // ... existing scenarios
  myScenario: module.myScenario,
};
```

4. Use in Markdown:

```html
<div class="nats-flow" data-scenario="myScenario"></div>
```

## Node Types

### Publisher Node
- Green indicator
- Source handle (right side)
- Use for message publishers

### Subscriber Node
- Blue indicator
- Target handle (left side)
- Use for message subscribers

### Service Node
- Purple indicator
- Target handle (left, top) for requests
- Source handle (right, bottom) for replies
- Use for request-reply services

## Edge Types

### Animated Edge
- Bezier curves
- Animated particles flowing along the path
- Customizable color, size, and labels
- Set `animated: true` in edge data to enable animation

## Styling

The component uses Tailwind CSS classes for styling. Colors follow NATS brand guidelines:

- Primary Blue: `#3b82f6`
- Green (success): `#10b981`
- Orange (warning): `#f97316`
- Purple (service): `#8b5cf6`
- Cyan (info): `#06b6d4`

## Development

### Testing Locally

1. Start the dev server:
```bash
cd new-nats.docs
npm start
```

2. Add a test flow to any `.md` file:
```html
<div class="nats-flow" data-scenario="publishSubscribe"></div>
```

3. View at `http://localhost:3000`

### Debugging

Enable browser console to see:
- Component loading status
- Scenario errors
- Rendering issues

Add `?debug=true` to any URL to enable React DevTools.

## Dependencies

- `@xyflow/react`: React Flow library
- `react` & `react-dom`: React 19
- `clsx` & `tailwind-merge`: Utility class management

All dependencies are already included in the main project's `package.json`.

## Credits

Based on the React Flow implementation from the `kubecon25-flow-ui` demo, adapted for Docusaurus integration.
