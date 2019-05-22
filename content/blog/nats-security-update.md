# nats-security-update

+++ categories = \["General", "Engineering"\] date = "2019-03-19" tags = \["security", "c", "cncf", "Cure53", "gnatsd", "go", "node"\] title = "NATS.io Security Update" author = "Colin Sullivan" +++

Often times, blogs or articles with titles like this one will contain bad news. That isn’t the case here! We’re sharing the results of our security review, and how that bolsters our new security features in the upcoming NATS server 2.0 release, expected in Q2 2019.

![NATS Security Image](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/nats-security-update/nats-security.png)

## Security Audit

In November of last year, the CNCF sponsored [Cure53](https://cure53.de/) to perform a security audit of the NATS server and some of the more popular NATS clients. We setup a secure server for Cure53 to attack and they analyzed our source code.

_“Cure53 chose a two-pronged approach to testing against NATS. In order to maximize coverage, the testers performed a source code audit, as well as engaged in classic penetration testing against a NATS-provided cloud instance.”_

Emphasis was on the [NATS server](https://github.com/nats-io/gnatsd) and our canonical client, the [Go client](https://github.com/nats-io/go-nats), since it is used as a reference for most other maintainer supported clients. The [C client](https://github.com/nats-io/cnats) and [Node.js](https://github.com/nats-io/node-nats) client were also tested.

## Summary

Overall, we feel NATS came out with flying colors. The server had one low rated vulnerability which was immediately fixed.

Simplicity pays off. The report noted that most of the NATS clients are small in comparison to other projects evaluated, thus presenting a small attack surface. Our canonical Go client had no issues reported. In the C client there was a critical overflow issue which was immediately fixed and all other issues have been fixed or addressed by the NATS team.

The full report can be found [here](https://github.com/nats-io/nats-general/blob/master/reports/Cure53_NATS_Audit.pdf).

## NATS Server 2.0

_**Private keys? We don’t need them.**_

We also asked Cure53 to analyze [NKEYS](https://github.com/nats-io/nkeys) \(NATS Encoded [Ed25519](https://ed25519.cr.yp.to/) keys\) and our [JWT](https://github.com/nats-io/jwt) technology which is used by the upcoming NATS security features in the NATS server 2.0 release. No vulnerabilities were found.

In version 2.0, NKEYS and NATS JWTs are used in a nonce-based client connect protocol, where the server holds a public NKEY and the client signs the nonce with its private NKEY. This allows NATS to be a zero trust system, where the server never ever reads or accesses your private keys used to connect. When combined with accounts and secure data sharing between accounts, security in your deployment can become decentralized.

Stay tuned for more about the NATS Server version 2.0, coming soon!

