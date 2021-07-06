+++
categories = ["Clients", "Java", "TLS", "OCSP"]
date = "2021-07-06"
tags = ["java", "ocsp", "stapling", "TLS"]
title = "Using OCSP Stapling with the NATS Java Library"
author = "Scott Fauerbach"
+++

# Using OCSP Stapling with the NATS Java Library

You already know that the [NATS Java library](https://github.com/nats-io/java-nats) can connect to the NATS Server
with TLS. The NATS Server now supports OCSP Stapling. To that end, I have built an example on how to set up the `SSLContext`
to use with the NATS Java Library. Mileage may vary, and you will need to incorporate your own certificates and key stores,
but this [OCSP Example](https://github.com/nats-io/java-nats-examples/tree/main/ocsp) will get you most of the way there.

## OCSP Stapling SSLContext

OCSP Stapling has been supported in Java since JDK 8. This excellent document from Oracle, [Client-Driven OCSP and OCSP Stapling](https://docs.oracle.com/javase/8/docs/technotes/guides/security/jsse/ocsp.html), describes it in detail.

### Examples

Example of creating the `SSLContext` can be found in the [OCSP Example Class](https://github.com/nats-io/java-nats-examples/blob/main/ocsp/src/main/java/io/nats/ocsp/OcspExample.java)
These are the methods of interest...

| Description | Method |
| --- | --- |
| _Standard TLS_ | `createStandardContext()` |
| _Vm Wide Check Revocation_ | `createVmWideOcspCheckRevocationContext()` |
| _Vm Wide Don't Check Revocation_ | `createVmWideOcspDontCheckRevocationContext()` |
| _Siloed Check Revocation_ | `createSiloedContextCheckRevocation()` |

### Entire VM Approach

It's trivial to turn on Client Side OCSP revocation checking. It's as simple as this code, adding system properties:

```
System.setProperty("jdk.tls.client.enableStatusRequestExtension", "true");
System.setProperty("com.sun.net.ssl.checkRevocation", "true");
```

The caveat here is that these properties apply to every single `SSLContext` running in that VM.
These properties are checked at runtime, each time a TLS handshake is made, so it cannot be turned on
to create an `SSLContext` then turned off. If it is turned off, revocation checking will not happen.

### Siloed Approach

If it's that easy to turn on OCSP stapling with revocation, why do we need the example?

Consider 3 different types of connections.

1. Standard TLS
2. OCSP with revocation checking
3. OCSP without revocation checking

It appears that setting the system properties does not affect Standard TLS certificate handshakes.
But if you need both OCSP with revocation checking and OCSP without, you cannot use the `com.sun.net.ssl.checkRevocation` property,
so you must use the siloed implementation for the context that will check revocation.
Find your configuration in this table to see if you have to set the system properties and which OCSP context implementation to use.

| Have Standard TLS? | Have  OCSP With Revocation? | Have OCSP Without Revocation? | Enable Status Request Extension Flag? | Check Revocation Flag? | Use Context Implementations | 
| --- | --- | --- | --- | --- | --- |
| Yes | No  | No  | false | false | _Standard TLS_ | 
| Yes | Yes | No  | true  | true  | _Standard TLS_ and _Vm Wide Check Revocation_ |
| Yes | No  | Yes | true  | false | _Standard TLS_ and _Vm Wide Don't Check Revocation_ |
| Yes | Yes | Yes | true  | false | _Standard TLS_, _Siloed Check Revocation_ and _Vm Wide Don't Check Revocation_ |
| No  | No  | No  | false | false | None |
| No  | Yes | No  | true  | true  | _Vm Wide Check Revocation_ |
| No  | No  | Yes | true  | false | _Vm Wide Don't Check Revocation_ |
| No  | Yes | Yes | true  | false | _Siloed Check Revocation_ and _Vm Wide Don't Check Revocation_ |

Please note, there are a few examples on the internet that guided development examples, in fact the siloed version is almost identical to those,
but none of them set the `enableStatusRequestExtension` flag. As far as we can tell it simply does not work without setting the flag.

## About the Author

Scott Fauerbach is a member of the engineering team at [Synadia Communications](https://synadia.com).

