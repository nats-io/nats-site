/**
 * NatsFlow Library Entry Point
 * 
 * This builds a STANDALONE bundle for use in static sites (like Hugo).
 * It includes React, ReactDOM, and all NatsFlow components in a single file.
 * 
 * Unlike loader.ts (which waits for external React), this is self-contained.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { NatsFlow } from './components/NatsFlow';
import {
  scenarios,
  PublishSubscribeAnimated,
  QueueGroupAnimated,
  SubjectsWildcardAnimated,
  WildcardComparison,
  ToggleableSubscribersScenario,
} from './components/NatsFlow/scenarios';

import './index.css';

// Components that can be rendered directly via data-component attribute
const components: Record<string, React.ComponentType<{ width?: number; height?: number }>> = {
  PublishSubscribeAnimated,
  QueueGroupAnimated,
  SubjectsWildcardAnimated,
  WildcardComparison,
  ToggleableSubscribersScenario,
};

// Expose React, ReactDOM, and NatsFlow to the window for the loader
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).React = React;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).ReactDOM = ReactDOM;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).NatsFlow = { NatsFlow, scenarios };

// Dispatch the custom event to notify the loader that components are ready
window.dispatchEvent(new Event('natsflow-loaded'));

// Auto-initialize function
function initializeFlows() {
  const containers = document.querySelectorAll<HTMLElement>(
    '.nats-flow:not([data-initialized])'
  );

  if (containers.length === 0) {
    return;
  }

  containers.forEach((container) => {
    const componentName = container.dataset.component;
    const scenarioName = container.dataset.scenario;
    const width = parseInt(container.dataset.width || '600', 10);
    const height = parseInt(container.dataset.height || '400', 10);
    const showControls = container.dataset.showControls === 'true';

    try {
      const root = ReactDOM.createRoot(container);

      // Check if rendering a component directly
      if (componentName) {
        const Component = components[componentName];
        if (!Component) {
          console.error(`Unknown component: ${componentName}`);
          container.innerHTML = `<div style="padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
            <strong>Error:</strong> Unknown component "${componentName}".
            <br>Available components: ${Object.keys(components).join(', ')}
          </div>`;
          container.setAttribute('data-initialized', 'true');
          return;
        }

        root.render(React.createElement(Component, { width, height }));
        container.setAttribute('data-initialized', 'true');
        return;
      }

      // Otherwise render a scenario with NatsFlow wrapper
      const scenario = scenarios[scenarioName || ''];

      if (!scenario) {
        console.error(`Unknown scenario: ${scenarioName}`);
        container.innerHTML = `<div style="padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
          <strong>Error:</strong> Unknown scenario "${scenarioName}".
          <br>Available scenarios: ${Object.keys(scenarios).join(', ')}
        </div>`;
        container.setAttribute('data-initialized', 'true');
        return;
      }

      root.render(
        React.createElement(NatsFlow, {
          scenario,
          width,
          height,
          showControls,
        })
      );

      container.setAttribute('data-initialized', 'true');
    } catch (error) {
      console.error(
        `Failed to initialize flow for ${componentName || scenarioName}:`,
        error
      );
      container.innerHTML = `<div style="padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
        <strong>Error:</strong> Failed to render flow diagram
        <br><small>${error instanceof Error ? error.message : String(error)}</small>
      </div>`;
      container.setAttribute('data-initialized', 'true');
    }
  });
}

// Setup MutationObserver for dynamic content (SPA navigation)
function setupObserver() {
  if (!document.body) {
    console.warn('[NatsFlow] document.body not available yet for observer');
    return;
  }

  const observer = new MutationObserver(() => {
    const hasNew = document.querySelector('.nats-flow:not([data-initialized])');
    if (hasNew) {
      initializeFlows();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  // console.log('[NatsFlow] MutationObserver initialized');
}

// Multiple strategies to ensure initialization
// console.log('[NatsFlow] Library loaded, readyState:', document.readyState);
if (document.readyState === 'loading') {
  // console.log('[NatsFlow] Waiting for DOMContentLoaded...');
  document.addEventListener('DOMContentLoaded', () => {
    initializeFlows();
    setupObserver();
  });
} else {
  // Already loaded, run immediately
  // console.log('[NatsFlow] DOM already loaded, initializing...');
  setTimeout(() => {
    initializeFlows();
    setupObserver();
  }, 0);
}

export { NatsFlow, scenarios };
