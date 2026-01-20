/**
 * NATS Flow Loader
 * 
 * USE CASE: For React-based documentation sites (like Docusaurus) where React 
 * and ReactDOM are ALREADY loaded externally by the framework.
 * 
 * This loader:
 * - Waits for external React/ReactDOM to be available on window
 * - Waits for NatsFlow components to be loaded separately
 * - Initializes .nats-flow elements after dependencies are ready
 * 
 * NOT FOR HUGO: If you're using Hugo or another static site generator without React,
 * use lib.tsx instead, which bundles everything together.
 * 
 * Key differences from lib.tsx:
 * - lib.tsx: Self-contained bundle (includes React) → Use for Hugo
 * - loader.ts: Expects external React → Use for Docusaurus/React apps
 */

import type React from 'react';
import type ReactDOM from 'react-dom/client';

interface NatsFlowComponents {
  NatsFlow: React.ComponentType<{
    scenario: unknown;
    width: number;
    height: number;
    showControls: boolean;
  }>;
  scenarios: Record<string, unknown>;
}

declare global {
  interface Window {
    NatsFlow?: NatsFlowComponents;
    React?: typeof React;
    ReactDOM?: typeof ReactDOM;
  }
}

(function () {
  // Wait for NatsFlow components to be loaded
  function waitForNatsFlow(): Promise<NatsFlowComponents | null> {
    return new Promise((resolve) => {
      if (window.NatsFlow) {
        resolve(window.NatsFlow);
        return;
      }

      // Listen for the custom event
      window.addEventListener(
        'natsflow-loaded',
        () => {
          resolve(window.NatsFlow || null);
        },
        { once: true }
      );

      // Timeout after 10 seconds
      setTimeout(() => {
        if (!window.NatsFlow) {
          console.error('NatsFlow components failed to load within timeout');
          resolve(null);
        }
      }, 10000);
    });
  }

  // Wait for React to be available (loaded by Docusaurus)
  function waitForReact(): Promise<{
    React: typeof React;
    ReactDOM: typeof ReactDOM;
  }> {
    return new Promise((resolve) => {
      const checkReact = () => {
        // React is available via Docusaurus
        if (window.React && window.ReactDOM) {
          resolve({ React: window.React, ReactDOM: window.ReactDOM });
          return;
        }
        // Keep checking
        setTimeout(checkReact, 100);
      };
      checkReact();
    });
  }

  // Initialize NatsFlow components on the page
  async function initializeFlows() {
    const containers = document.querySelectorAll<HTMLElement>(
      '.nats-flow:not([data-initialized])'
    );

    if (containers.length === 0) {
      return;
    }

    // Wait for components to be available
    const components = await waitForNatsFlow();
    if (!components) {
      console.error('NatsFlow components not available');
      containers.forEach((container) => {
        container.innerHTML = `<div style="padding: 1rem; background: #fee; border: 1px solid #fcc; border-radius: 4px;">
          <strong>Error:</strong> NatsFlow components failed to load
        </div>`;
        container.setAttribute('data-initialized', 'true');
      });
      return;
    }

    const { NatsFlow, scenarios } = components;

    // Wait for React to be available
    const { React, ReactDOM } = await waitForReact();

    containers.forEach((container) => {
      const scenarioName = container.dataset.scenario;
      const width = parseInt(container.dataset.width || '600', 10);
      const height = parseInt(container.dataset.height || '400', 10);
      const showControls = container.dataset.showControls === 'true';

      try {
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

        // Create a root and render the NatsFlow component
        const root = ReactDOM.createRoot(container);
        const element = React.createElement(NatsFlow, {
          scenario,
          width,
          height,
          showControls,
        });
        root.render(element);

        container.setAttribute('data-initialized', 'true');
      } catch (error) {
        console.error(
          `Failed to initialize flow for scenario ${scenarioName}:`,
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

  // Initialize when ready
  function tryInit() {
    initializeFlows();
  }

  // Multiple strategies to ensure initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    setTimeout(tryInit, 100);
  }

  // Also listen for the natsflow-loaded event
  window.addEventListener('natsflow-loaded', tryInit);

  // MutationObserver for dynamic content (Docusaurus navigation)
  const observer = new MutationObserver(() => {
    const hasNew = document.querySelector('.nats-flow:not([data-initialized])');
    if (hasNew) {
      tryInit();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
