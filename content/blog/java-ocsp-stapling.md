+++
categories = ["Clients", "Java", "TLS", "OCSP]
date = "2021-07-06"
tags = ["java", "ocsp", "stapling", "TLS]
title = "Using OCSP Stapling with the NATS Java Library"
author = "Scott Fauerbach"
+++

You already know that the <a href="https://github.com/nats-io/java-nats">NATS Java library</a> can connect to the NATS Server
with TLS. The NATS Server now supports OCSP Stapling. To that end, I have built an example on how to set up the SSLContext
to use with the NATS Java Library. Mileage may vary, and you will need to incorporate your own certificates and key stores,
but this [OCSP Example](https://github.com/nats-io/java-nats-examples/tree/main/ocsp) will get you most of the way there.

# OCSP Stapling SSLContext

OCSP Stapling is supported in Java since JDK 8. There is an excellent document from Oracle which describes it in detail.

[Client-Driven OCSP and OCSP Stapling](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/ocsp.html)

### Entire VM Approach

It's actually trivial to turn on Client Side OCSP Revocation checking. It's as simple at this code, adding System Properties:

```java
System.setProperty("jdk.tls.client.enableStatusRequestExtension", "true");
System.setProperty("com.sun.net.ssl.checkRevocation", "true");
```

The caveat here is that these properties apply to every single SSLContext running in that VM.
These properties are checked at runtime, each time a TLS handshake is made, so it cannot be turned on
to create an `SSLContext` then turned off. If it is turned off, revocation checking will not happen.

The example `getVmWideContext()` shows how to make a Vm-Wide SSLContext. See the [OCSP Example Class](src/main/java/io/nats/ocsp/OcspExample.java)

### Siloed Approach

If it's that easy to turn on OCSP stapling with revocation, why do we need the example?

Consider 3 different types of connections.

1. Standard TLS
2. OCSP with Revocation checking (OCSP W/REV)
3. OCSP with no Revocation checking (OCSP NO REV)

It appears that setting the System Properties does not affect Standard TLS certificate handshakes.
Find your configuration in this table to see if you have to set the System Properties.

| Standard TLS | OCSP W/REV | OCSP NO REV | `enableStatusRequestExtension` | `checkRevocation` |
| --- | --- | --- | --- | --- |
| Yes | No | No | false | false |
| Yes | Yes | No | true | true |
| Yes | No | Yes | true | false |
| No | No | No | false | false |
| No | Yes | No | true | true |
| No | No | Yes | true | false |
| Yes | Yes | Yes | true | __siloed__ |
| No | Yes | Yes | true | __siloed__ |

Please be aware. There are a few examples on the internet that guided development example, in fact it is almost identical to those,
but none of them set the `enableStatusRequestExtension` flag. As far as we can tell it simply does not work without setting the flag!

The example `getSiloedContext()` shows how to make a siloed SSLContext that does revocation checking. See the [OCSP Example Class](src/main/java/io/nats/ocsp/OcspExample.java)

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).

