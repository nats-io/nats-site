+++
date = "2022-11-29"
draft = true
title = "Getting started with nats.ws"
author = "Byron Ruth"
categories = ["General"]
tags = ["NATS", "WebSockets", "JavaScript", "SolidJS"]
+++

For those relatively new to NATS, it may come as a surprise that the NATS server has [native support for WebSockets](https://docs.nats.io/running-a-nats-service/configuration/websocket)!

What this means in practice, is that the NATS server binary is able to support direct WebSocket connections from the browser (or other clients) using it as a transport layer for the [NATS protocol](https://docs.nats.io/reference/reference-protocols/nats-protocol) rather than raw TCP packets. This is not only useful for building Web applications, but it can be useful in enterprises where only certain ports and protocols are allowed.

In addition to server-side support, there is an official [nats.ws](https://github.com/nats-io/nats.ws) client library which builds upon the [nats.deno](https://github.com/nats-io/nats.deno) client library and swaps out the transport layer for WebSockets.

## Enabling WebSockets

The minimum requirement is to declare the `websockets` block in the server config.

```
websockets: {}
```

Yes, that is really it. However, there are a handful of [configuration options](https://docs.nats.io/running-a-nats-service/configuration/websocket/websocket_conf) you will want to review if you are hosting the servers yourself. For example, by default it assumes TLS is required and attempts to bind on port 443.

For this post, we will be using the convenient NATS demo server which exposes the WebSocket interface over port `8443`.

If you have the [NATS CLI](https://docs.nats.io/running-a-nats-service/clients#installing-the-nats-cli-tool) installed, you can test out the endpoint easily.

```
$ nats -s wss://demo.nats.io:8443 req 'greet.sue' ''
14:11:01 Sending request on "greet.sue"
14:11:01 Received with rtt 92.717194ms
Hello, pam
```

Although it's nice the NATS CLI natively supports testing out the WebSocket interface, the purpose of this blog post is to showcase how straightforward it is to get started with using NATS **in the browser**.

## No frameworks, no build tools

The first point to highlight, which is a core principle held by the maintainers of NATS, including the server and official client libraries, is *simplicity*. Simple is hard, and the maintainers strive to make everything with NATS as simple as possible.

In this case, we can see that enabling WebSocket support on the server is a matter of declaring a server configuration block. For nats.ws itself, it comes in the form of only **two** transitive dependencies for the library (`node_modules` memes do not apply here 😄).

Another example of NATS simpicity is being able to try it without any additional steps. Here is a full working example that can be pasted into an HTML file and opened locally within your browser. The output is written to the browser's console. No frameworks or build tools required.

```html
<!doctype html>
<html>
  <head>
    <script defer type="module">
      // ES6 modules can be natively used by set the script type
      // to "module". Now we can use native imports.
      import {
        connect,
        StringCodec,
      } from "https://cdn.jsdelivr.net/npm/nats.ws@1.10.0/esm/nats.js";

      // Initialize a string codec for encoding and decoding message data.
      // This is needed because NATS message data is just byte arrays, so proper
      // encoding and decoding needs to be performed when using and working
      // with the message data.
      // See also JSONCodec.
      const sc = new StringCodec();

      // Establish a connection to the NATS demo server. This uses the
      // native WebSocket support built into the NATS server.
      const nc = await connect({
        servers: ["wss://demo.nats.io:8443"],
      });

      // Subscribe to the "echo" subject and define a message
      // handler that will respond to the requester.
      const sub = nc.subscribe("echo");
      const handle = (msg) => {
        console.log(`Received a request: ${sc.decode(msg.data)}`);
        msg.respond(msg.data);
      }

      // Wait to receive messages from the subscription and handle them
      // asynchronously..
      (async () => {
        for await (const msg of sub) handle(msg)
      })();

      // Now we can send a couple of requests to that subject. Note how we
      // are encoding the string data on request and decoding the reply
      // message data.
      let rep = await nc.request("echo", sc.encode("Hello!"));
      console.log(`Received a reply: ${sc.decode(rep.data)}`);

      rep = await nc.request("echo", sc.encode("World!"));
      console.log(`Received a reply: ${sc.decode(rep.data)}`);

      // Finally drain the connection which will handle any outstanding
      // messages before closing the connection.
      nc.drain();
    </script>
  </head>
</html>
```

Or if you prefer, try out this code as a [jsFiddle example](https://jsfiddle.net/qaxhr7y8/).

## Using with component libraries

For more complex applications you may prefer to use a component-model library or full-fledged framework with tightly-integrated build tools.

Arguably, the most pervasive component library used today is [ReactJS](https://reactjs.org). However, there are a handful of popular alternatives with different designs and trade-offs, including an up-and-coming one called [SolidJS](https://www.solidjs.com/).

If you have not heard about SolidJS, but are familiar with React, I suggest you [watch this progressive introduction](https://www.youtube.com/watch?v=O6xtMrDEhcE) at React Finland (yes, at a React conference) by the creator [Ryan Carniato](https://twitter.com/RyanCarniato).

The two examples below assume a top-level `App` component that establishes a single NATS connection over WebSockets and treats it as a _state_ value so it can be passed down through props and properly signal a re-render when first established or the connection value changes.

### ReactJS

For this example, use the [standard installation](https://nextjs.org/docs/getting-started#automatic-setup) to bootstrap a vanilla NextJS project (`create-react-app` works just as well if you prefer that):

```
$ npx create-next-app@latest --typescript
# Follow the prompts...
# cd into the created directory then run...
$ npm run dev
```

Then the below code can replace the contents of `pages/index.tsx`.

```typescript
import {
  connect,
  NatsConnection,
} from "nats.ws";

import {
  useEffect,
  useState,
} from "react";

export default function Home() {
  const [nats, setNats] = useState<NatsConnection>();

  useEffect(() => {
    (async () => {
      const nc = await connect({
        servers: ["wss://demo.nats.io:8443"],
      })
      setNats(nc)
      console.log("connected to NATS")
    })();

    return () => {
      nats?.drain();
      console.log("closed NATS connection")
    }
  }, [])

  return (
    <>
      {nats && (
        <h1>Connected to {nats?.getServer()}</h1>
      )}
      {!nats && (
        <h1>Connecting to NATS...</h1>
      )}
    </>
  )
}
```

### SolidJS

To bootstrap this example, use the [standard method](https://www.solidjs.com/guides/getting-started#try-solid):

```
$ npx degit solidjs/templates/ts nats-ws-solid-js
$ cd nats-ws-solid-js
$ npm install
$ npm run dev
```

Then the below code can replace the contents of `src/App.tsx`.

```typescript
import {
  connect,
  NatsConnection,
} from 'nats.ws';

import {
  createSignal,
  onCleanup,
  onMount,
} from 'solid-js';

export default function App() {
  const [nats, setNats] = createSignal<NatsConnection>();

  onMount(async () => {
    const nc = await connect({
      servers: ["wss://demo.nats.io:8443"],
    });
    setNats(nc)
  });

  onCleanup(() => {
    nats()?.drain();
  })

  return (
    <>
      {nats() && (
        <h1>Connected to {nats()?.getServer()}</h1>
      )}

      {!nats() && (
        <h1>Connecting to NATS...</h1>
      )}
    </>
  )
};
```
