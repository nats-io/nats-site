import { ExampleFlow } from "./components/ExampleFlow";

export default function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Testing ExampleFlow (Direct Component)</h1>
      <div style={{ width: "800px", height: "600px", border: "1px solid black" }}>
        <ExampleFlow />
      </div>

      <h1 style={{ marginTop: "40px" }}>Testing NatsFlow Loader</h1>
      <p>This should be automatically populated by the loader:</p>
      <div 
        className="nats-flow" 
        data-scenario="publishSubscribe"
        data-width="800"
        data-height="400"
        data-show-controls="true"
      >
        Loading...
      </div>
    </div>
  );
}
