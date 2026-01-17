# NatsFlow React

Interactive NATS messaging diagrams built with React Flow. This project can be used both as a standalone development environment and as a library bundle for static sites.

## Quick Start

### Development

```bash
npm install
npm run dev
```

This starts the Vite dev server with hot reload for developing components.

### Building for Production

```bash
npm run build:lib
```

Creates production bundles in `dist/`:
- `natsflow.js` - Standalone bundle with React and all dependencies
- `natsflow.css` - Component styles

## Usage

### Option 1: For Static Sites (Hugo, Jekyll, etc.)

**Use case:** You have a static site without React and want to embed interactive NATS diagrams.

**Entry point:** `src/lib.tsx` (self-contained bundle)

#### 1. Build the library

```bash
npm run build:lib
```

#### 2. Copy to your static site

```bash
npm run build:copy  # Copies to ../static/
```

Or manually copy:
- `dist/natsflow.js` → your static assets folder
- `dist/natsflow.css` → your static assets folder

Make sure you hard refresh in the browser to see the changes. The browser could cache those JS/CSS files so on refresh you may not see them. You can confirm they copied over by making a small change, building, copying, and looking at the `static/js/` or `static/css` folder in the Hugo project.

#### 3. Enable NatsFlow on a page

Add to your page's frontmatter:

```yaml
---
title: "My Page"
hasNatsFlow: true
---
```

The NatsFlow CSS and JS will automatically load only on pages with `hasNatsFlow: true`.

#### 4. Add diagrams to your content

In your Markdown or HTML:

```html
<div 
  class="nats-flow" 
  data-scenario="publishSubscribe"
  data-width="800"
  data-height="400"
  data-show-controls="true">
</div>
```

**How it works:**
- `lib.tsx` bundles React, ReactDOM, and all NatsFlow components into one file
- When loaded, it automatically scans for `.nats-flow` elements and renders them
- Includes a MutationObserver to handle dynamically added content

---

### Option 2: For React Apps (Docusaurus, etc.)

**Use case:** You have a React-based site where React is already loaded by the framework.

**Entry point:** `src/loader.ts` (expects external React)

#### Setup

1. Import NatsFlow components and loader in your app:

```tsx
import { NatsFlow } from './components/NatsFlow';
import { scenarios } from './components/NatsFlow/scenarios';
import './loader';

// Expose to window for loader
window.React = React;
window.ReactDOM = ReactDOM;
window.NatsFlow = { NatsFlow, scenarios };

// Notify loader
window.dispatchEvent(new Event('natsflow-loaded'));
```

2. Use `.nats-flow` divs in your content as shown above.

**How it works:**
- `loader.ts` waits for React/ReactDOM to be available on `window`
- Waits for your NatsFlow components to be loaded
- Initializes diagrams after all dependencies are ready
- More efficient than `lib.tsx` since it doesn't duplicate React

---

## Key Differences: lib.tsx vs loader.ts

| Feature | `lib.tsx` | `loader.ts` |
|---------|-----------|-------------|
| **Use case** | Static sites (Hugo, Jekyll) | React apps (Docusaurus) |
| **React bundled?** | ✅ Yes, includes React | ❌ No, expects external React |
| **File size** | Larger (~150KB+) | Smaller (~10KB) |
| **Dependencies** | Self-contained | Requires React on `window` |
| **Best for** | Non-React sites | React-based sites |

---

## Available Scenarios

- `publishSubscribe` - Basic pub/sub pattern with NATS server

## Data Attributes

Configure diagrams using data attributes:

- `data-scenario` (required) - Name of the scenario to render
- `data-width` (optional, default: 600) - Width in pixels
- `data-height` (optional, default: 400) - Height in pixels
- `data-show-controls` (optional, default: false) - Show React Flow controls

## Project Structure

```
src/
├── components/
│   ├── ExampleFlow/          # Example interactive flow
│   └── NatsFlow/             # Main NatsFlow component
│       ├── scenarios/        # Scenario definitions
│       ├── nodes/            # Custom node types
│       └── edges/            # Custom edge types
├── lib.tsx                   # Library entry (for static sites)
├── loader.ts                 # Loader (for React apps)
├── main.tsx                  # Dev app entry
└── App.tsx                   # Dev app component
```

## Adding New Scenarios

1. Create a new file in `src/components/NatsFlow/scenarios/`:

```typescript
import type { NatsFlowScenario } from '../../../types';

export const myScenario: NatsFlowScenario = {
  description: 'My custom scenario',
  nodes: [
    // your nodes
  ],
  edges: [
    // your edges
  ],
};
```

2. Export it from `src/components/NatsFlow/scenarios/index.ts`:

```typescript
export { myScenario } from './myScenario';
```

3. Add to scenarios object:

```typescript
export const scenarios = {
  // ...
  myScenario,
};
```

4. Rebuild: `npm run build:lib`

## Resources

- [React Flow Documentation](https://reactflow.dev)
- [NATS Documentation](https://docs.nats.io)
