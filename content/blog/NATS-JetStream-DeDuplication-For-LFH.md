+++
date = "2021-07-19"
draft = false
title = "NATS JetStream Deduplication for LinuxForHealth Blockchain Smart Contract Messaging"
author = "Carole Corley"
categories = ["General", "Engineering", "Guest Post", "JetStream"]
tags = ["NATS", "JetStream", "IBM", "Deduplication"]
+++

Deduplication of messages is a key NATS JetStream feature needed by the LinuxForHealth open source project to implement blockchain smart contract messaging.  Messaging from a smart contract allows the contract to notify NATS subscribers of key contract-based decisions.  This is especially helpful for blockchain client applications that may not utilize a full blockchain node and can enable message-driven smart contract workflows.

While messaging from a smart contract is desirable, every blockchain node runs the same smart contract and, as such, will publish the same NATS message.  Thus, deduplication is a necessity.  The remainder of this post explains the LinuxForHealth blockchain solution flow and the NATS JetStream configuration that enabled it.

## Solution Data Flows
LinuxForHealth handles healthcare protocol validation, data syncronization and secure transmission of healthcare data to downstream servers and includes a blockchain client.  An example deployment is shown below.

{{< figure src="/img/blog/NATS-JetStream-DeDuplication-For-LFH/LFH-NATS-Arch.png" alt="LinuxForHealth NATS Architecture" >}}

In this scenario, we send an X12 270 eligibility verification request and receive the eligibility result from the blockchain via the following steps:
- The LinuxForHealth client converts the X12 270 to FHIR and sends the request to LinuxForHealth connect;
- Connect stores the transaction down to the Kafka-based longitudinal patient record, then emits a NATS EVENTS.sync data synchronization message;
- The blockchain client is listening for EVENTS.sync messages and sends the message payload via gRPC to a blockchain network node;
- The smart contract validates the FHIR data, then performs a healthcare insurance eligibility verification check;
- The smart contract's NATS.js JetStream client publishes the eligibility result to the LinuxForHealth NATS JetStream server, using the caller-supplied unique transaction id as the value for the `Nats-Msg-Id` header;
- The LinuxForHealth client receives the eligibility result by consuming from the JetStream consumer, via a subscription to the consumer's target subject `eligibility.EVENT` and converts it to an X12 271 response.

In the steps above, it is the `Nats-Msg-Id` header that allows JetStream to deduplicate the messages so that only one message from all the smart contract copies running on all the blockchain nodes is delivered to NATS subscribers.

## NATS JetStream Deduplication Configuration
The deduplication configuration consists of a JetStream stream, a stream consumer, a JetStream publisher and a NATS subscriber, each of which is shown below.

### The JetStream Stream
The JetStream stream is defined via the command line.  Note the --dupe-window is set to 30s, which may be adjusted as needed.
```shell
docker exec -it "${NATS_SERVICE_NAME}" \
              nats --server="${NATS_SERVICE_NAME}":"${NATS_CLIENT_PORT}" \
              --tlscert="${TLSCERT}" \
              --tlskey="${TLSKEY}" \
              --tlsca="${TLSCA}" \
              --nkey="${NKEY}" \
              str add EVENTS \
              --subjects EVENTS.* \
              --ack \
              --max-msgs=-1 \
              --max-bytes=-1 \
              --max-age=1y \
              --storage file \
              --retention limits \
              --max-msg-size=-1 \
              --discard old \
              --dupe-window=30s
```

### The JetStream Consumer
The JetStream consumer is also defined via the command line.  Note the --filter value is the original subject the eligibility result is published to, while the --target value is what the subscriber will use to consume messages from the consumer.
```shell
docker exec -it "${NATS_SERVICE_NAME}" \
              nats --server="${NATS_SERVICE_NAME}":"${NATS_CLIENT_PORT}" \
              --tlscert="${TLSCERT}" \
              --tlskey="${TLSKEY}" \
              --tlsca="${TLSCA}" \
              --nkey="${NKEY}" \
              con add EVENTS ELIGIBILITY \
              --ack none \
              --target eligibility.EVENTS \
              --deliver last \
              --replay instant \
              --filter EVENTS.eligibilityresponse
```

### The JetStream Publisher
The JetStream publisher is written in Node.js as a part of the smart contract.  The smart contract creates the NATS connection and JetStream client on the first message processed, specifying the URL of the NATS JetStream server running in a docker container, as well as the NKey used to secure connections and the CA cert for TLS:
```shell
async createNATSClient(): Promise<nats.JetStreamClient> {
        const nkey = fs.readFileSync(path.resolve(__dirname, '../conf/nats-server.nk'));
        let server: string = 'tls://nats-server:4222';
        
        let nc = await nats.connect({
            servers: server,
            authenticator: nats.nkeyAuthenticator(new TextEncoder().encode(nkey.toString())),
            tls: {
                caFile: path.resolve(__dirname, '../conf/lfh-root-ca.pem'),
            }
        });

        // create a jetstream client:
        const js = nc.jetstream();
        return js;
    }
```

The JetStream client publishes messages to the NATS JetStream server, with the `"Nats-Msg-Id"` header specified for deduplication within the window configured for the stream:
```shell
    async sendNATSMessage(subject: string, message: any) {
        if (!this.nats_client) {
            this.nats_client = await this.createNATSClient();
        }

        try {
            const headers = nats.headers();
            headers.append("Nats-Msg-Id", message.id);
            await this.nats_client.publish(subject, new TextEncoder().encode(JSON.stringify(message)), { headers });
        } catch (ex) {
            console.log(`Error publishing to JetStream stream: ${ex}`);
        }
    }
```

### The NATS Subscriber
The subscriber is written in Python and uses the NATS client to subscribe, benefitting from server-side NATS JetStream deduplication.  The subscriber is running on localhost, not in a docker container.  Note the subscription to `eligibility.EVENTS` as indicated by the JetStream Consumer --target value:
```shell
   async def start_nats_coverage_eligibility_subscriber(self) -> None:
        ssl_context = ssl.create_default_context(ssl.Purpose.SERVER_AUTH)
        ssl_context.load_verify_locations(cafile="./lfh-root-ca.pem")
        self.nats_client = NatsClient()
        await self.nats_client.connect(
            servers="tls://localhost:4222",
            nkeys_seed="./nats-server.nk",
            loop=get_running_loop(),
            tls=ssl_context,
            allow_reconnect=True,
            max_reconnect_attempts=10,
        )
        # consume the NATS JetStream Consumer
        await self.nats_client.subscribe("eligibility.EVENTS", cb=self.nats_coverage_response_callback)
```

The subscribe call specifies a `nats_coverage_response_callback` method that receives the eligibility verification result messages:
```shell
    async def nats_coverage_response_callback(self, msg: Msg) -> None:
        subject = msg.subject
        reply = msg.reply
        data = msg.data.decode()
        print(f"Received a message on {subject} {reply}: {data}")
```

## Testing
This configuration was tested using [NATS JetStream v0.0.19](https://github.com/nats-io/jetstream), [LinuxForHealth connect 0.42.0](https://linuxforhealth.github.io/docs/) and [Hyperledger Fabric 2.3](https://hyperledger-fabric.readthedocs.io/en/release-2.3/).  Further details about testing with a Hyperledger Fabric test-network instance can be found in the [LinuxForHealth connect Github repo](https://github.com/LinuxForHealth/connect/blob/main/local-config/fabric/README.md).

This blockchain messaging approach using NATS JetStream can be used with Ethereum, R3, Daml and other blockchain technologies. Stay tuned for additional LinuxForHealth blockchain messaging implementations on https://linuxforhealth.github.io/docs/.

## About the Author
Carole Corley is a Senior Technical Staff Member at IBM, focused on creating LinuxForHealth, a distributed, multi-platform Health OS.
