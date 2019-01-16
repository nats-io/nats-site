+++
categories = ["Community", "Newsletter"]
date = "2019-01-16"
tags = ["nats", "microservices", "technical", "ngs", "synadia","features"]
title = "A 2018 NATS.io Year in Review + A Look Forward to What’s Coming in 2019"
author = "Derek Collison"
+++
## 2018 was a banner year for the NATS.io ecosystem!
  * NATS was accepted as a project into the CNCF organization
  * NATS is being used in mission-critical production deployments around the globe and continues to grow
  * And at almost 8 years old, 2018 saw the most features ever added to the project since its inception

At the start of 2018, the team set a course to provide additional security options, secure multi-tenancy, and larger network options for NATS to name just a few. The team succeeded in delivering all of these and more.

## NATS.io saw the introduction of Nkeys and JWT support for authentication and authorization
Nkeys, an encoded [Ed25519](https://ed25519.cr.yp.to/) key pair allows for the NATS system to have no knowledge whatsoever of a user’s private keys. The NATS client libraries sign a challenge nonce from the server to provide identity and wipe the secret key from the client’s memory. The private key is never exposed or even transmitted to the NATS servers.

JWTs are now supported to allow decentralized management for authentication and authorization. This means you no longer have to change a NATS server’s configuration file to add or delete users or change their individual permissions. These can all be represented in the JWTs.
 
## Accounts for secure multi-tenancy within NATS were also introduced
Think of Accounts as containers for messaging. Accounts provide a secure context to communicate among multiple users of the same Account without having messages travel outside of the Account domain. This allows multiple organizations, users, or companies to utilize a shared infrastructure while remaining isolated and secure, greatly reducing operational costs.

Operators and Users accompany Accounts and can be represented through signed JWTs and be managed decentrally, with the NATS servers only needing to be configured with the Operators they should trust. Operators can have multiple signing keys, therefore never exposing the master Operator private key. Operators sign for Accounts, and Accounts sign for Users.

## Introducing Streams and Services
While Accounts default to create isolated communication contexts, we believe the real power of Accounts is when you can securely and selectively share between Accounts. This led the team to introduce streams and services.

  * Streams are message streams that can be shared with other Accounts.
  * Services are responders who can receive requests and return a response to the requestor in a secure and anonymous way.

Streams and Services can be shared among Accounts and can be public, or require authorization from the source Account owner. We feel these will open up a tremendous opportunity for future collaboration and are one of the key tenants to utilizing very large and shared NATS infrastructures. These are also a key tenant to Synadia’s global offering, [NGS](https://synadia.com/ngs). With a broad range of streams and services available for new customers, NGS will become a needed global communication tool for modern architectures.

To form even larger networks we needed to develop and offer additional topologies beyond what we had at the beginning of 2018. We have delivered on one new topology, internally called gateways, that allow for superclusters to be formed. Think of these as clusters of clusters. These are highly resilient, self-healing, and take a different approach to interest graph and data propagation. We will follow up with more information and details on superclusters in a future newsletter.

2018 was a great year, and we ask for a bit of patience as we try to catch up on the documentation for all of these new features. Rest assured it is a top priority for us for the beginning of 2019.
 
## Looking ahead in 2019
Speaking of 2019, we have some ambitious goals entering the new year. We believe NATS will be the technology to connect all of the world’s digital systems, services, and devices. From the Cloud, to Edge, and IoT.

Our goals for 2019 include expanding NATS while maintaining its core philosophy. NATS will continue to be easy to use and operate, will remain secure by default, be extremely performant, self-healing, and be ubiquitous across different platforms from Cloud, to Edge to IoT.
 
In 2019 you will see several major additions and changes to the NATS.io ecosystem

  * The long-awaited renaming of ‘gnastd’ to “nats-server”. This will provide resolution to [issue #226](https://github.com/nats-io/gnastd/issues/226) to return the server to its original 2010 name.
  * We plan to extend into web and mobile and IoT with the addition of WebSockets as a supported transport.
  * The introduction of native support for MQTT clients as we continue our push towards Edge and IoT.
  * As a follow up to NATS Streaming, we will introduce what we are internally referring to as JetStream, to address some requested additions to our current offering.
  * In addition, we will add in a third topology option called leaf nodes, which I am personally very excited about. These are logical extensions from a supercluster that can live in your home, office, car, etc. These will allow separate auth domains to be part of a large network like NGS and take advantage of global connectivity and the growing value of a rich ecosystem of streams and services without having to connect a client directly to NGS

## We are deeply grateful for the NATS.io ecosystem!
We are honored to have expanded the NATS maintainer team to include Brian Shannan [@brianshannan](https://github.com/brianshannan), Charlie Strawn [@charliestrawn](https://github.com/charliestrawn), Lev Brouk [@levb](https://github.com/levb), Paulo Pires [@pires](https://github.com/pires), and R.I. Pienaar [@ripienaar](https://github.com/ripienaar).  It is an amazing community to be a part of and we expect that to become even better. The world of OSS is changing and evolving and we are committed to having NATS be one of the best OSS projects and ecosystems around, providing tremendous value to our users.

We are beyond thrilled for what we have achieved together in 2018, and even more excited about what 2019 has in store for us!


Thanks,

=derek