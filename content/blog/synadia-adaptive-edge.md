+++
date = "2020-10-30"
draft = false
title = "Introducing the NATS Adaptive Edge Architecture"
author = "Colin Sullivan"
categories = ["Engineering", "Architecture", "IoT"]
tags = ["NATS", "Synadia"]
+++

# Overview

At [Synadia](https://synadia.com) we have the goal of unifying all cloud, edge, and IoT communications.  We guide companies in their journey from where they are at today toward efficiently operating a secure and resilient modern distributed communications system and leverage the [NATS.io](https://nats.io) project to get them there.  Derek Collison, creator of NATS, founded Synadia which helps sponsor the NATS project by stewarding and donating the time and effort.

We see users deploy NATS that fit into a few buckets - a single cluster [k8s](http://kubernetes.io) deployment, a cluster of NATS servers in the cloud on VMs or on bare metal.  As companies grow we see many multi-regional deployments spread out geographically, in data centers, across cloud providers or more often now with hybrid deployments.

More recently we're seeing a pattern emerge with a central group of applications servicing and receiving data from edge nodes.  Usually there is telemetry coming from the edge, and sometimes edge nodes have their own services around command and control and access to local data.  This isn't unusual - it's the federated edge compute with IoT pattern.

What is really interesting is that we're seeing this pattern applied to many different market verticals as businesses push computing to the edge.  Often, users have glued disparate technologies together with different security domains invariably resulting in systems that are fragile, unsecure, and expensive to maintain.  This problem can be elegantly avoided with what we have called the **NATS Adaptive Edge Architecture** - a flexible deployment topology overlayed with NATS multi-tenant security model.

# Security

In NATS 2.0, we enhanced security around the concept of [operators and accounts](https://docs.nats.io/nats-tools/nsc/nsc#creating-an-operator-account-and-user).  An operator is a "owner" of a NATS deployment, such as an Ericsson, Mastercard, or Synadia.  Operators create accounts - think of accounts like *"containers for messaging"* - true multi-tenancy.  An account might contain users representing a group of applications, a regional deployment, or a business unit.  Note that we're moving toward zero trust, so in operator mode, even with this notion of accounts and users, the NATS system **never** stores or accesses a private NATS key.

When a NATS client connects its credentials indicates it belongs to a particular account.  Its subject namespace (where it can send and receive data) exists only within its account.  This means that by default, data will never traverse an account boundary and a client can only directly communicate with other clients in the same account, even if using the same subjects.

However, accounts can import and export **streams** (think telemetry) or **services** (think RPC) with other accounts allowing one to securely share specific data and map subjects, effectively decoupling data access from the application subject namespace.  Within a deployment, streams and services may be made public for all accounts to import, or private to  adhere to the strictest of security policies.  Because security is truly bifurcated from connectivity, if one chooses accounts may only exist on a subset of servers to create data silos.

# Deployment Topologies

Along with the security in NATS 2.0, we wanted to tackle the problem of easily and reliably connecting different regions of NATS server [clusters](https://docs.nats.io/nats-server/configuration/clustering) together.  In terms of interest propagation, one large NATS cluster spread out over regions was too chatty for most use cases, so we created the concept of [gateway connections](https://docs.nats.io/nats-server/configuration/gateways) between NATS clusters.  This spline based architecture has the resiliency of multiple connections while being intelligent about interest propagation to automatically reduce chatter.  This is a necessary optimization for long haul or lower bandwidth connections with today's data rates.

When we were doing this Derek (the creator of NATS) came up with the concept of a [leaf node](https://docs.nats.io/nats-server/configuration/leafnodes) where a NATS server could connect to a cluster and act more like a client than a server, extending a cluster with the potential to bridge security domains while providing the best latency between local applications.  It can still function when disconnected to the remote cluster.  At the time we weren't exactly sure how leaf nodes would be received, but had some inkling that it might be a sleeper.  It turns out that this was *so much more powerful than we ever imagined*.  Then when combined with NATS 2.0 security, we ended up with a truly elegant solution to massive federated deployments with edge computing - the **NATS Adaptive Edge Architecture**.

# The NATS Adaptive Edge Architecture

This is fairly straightforward.  You establish a number of NATS clusters on the back end - in datacenters, cloud, bare metal, or hybrid - it doesn't matter to NATS.  Connectivity is then extended out to the edge to via leaf nodes create a massive data connectivity plane.  This is the first layer, like an electrical grid for data.  Security is next - think of NATS security as switches that determining exactly what data can flow where, with applications connectivity bounded by NATS accounts, and sharing of data occurs through importing and exporting streams and services.  Combining this deployment model with NATS multitenancy features you can create a truly massive system that can be both manageable and secure.  

Because accounts contain their own subject namespaces, if applicable each edge deployment can look exactly the same and you won't have subject collisions.  No more meetings deciding how to hierarchically setup a namespace!  It's compartmentalized  meaning your applications are easy to enhance and it won't affect the rest of the system.  Exports and imports can allow any permitted NATS client to interact with any other permitted NATS client securely and seamlessly, from anywhere in the deployment.  Because a NATS server exists on the edge, **your remote services can still operate automonomously** when separated from the network (with a bit of planning of course).

## Intentional Silos
While you'll have complete connectivity, data flow should be restricted, sometimes isolated in silos with limited access.  One might do this for manageability - aggregating vast amounts of sensor data on the edge data to then use AI to provide meaningful context as a stream.  Or you may need to enforce policy such as keeping medical data concerning health within a set of servers on premise for GDPR compliance.  Account setup would guarantee that data never leaves a location unless it is supposed to.

## Simple Clients
Regardless of security and deployment topology, NATS clients remain simple because they only care about connecting, publishing and/or receiving data.  No server state is maintained, allowing you to scale or change your NATS server deployments anytime, without affecting clients, effectively *future-proofing* your technological solution.


# Example Use Case - Industry 4.0
Let's look at a manufacturing use case.  As manufacturing continues to transition to Industry 4.0 the metadata concerning manufacturing processes is more valuable than it ever has been.  IIoT adoption has created a wealth (and firehose) of data.  Temperature fluctuations in machinery can be used in predictive failure analysis.  Sometimes parts need to have metadata about their production that are required to be stored for decades (e.g. Aviation).  Much of this needs to be handled with extremely low latencies where tromboning to a back-end in a cloud or remote data-center is not tenable.

## Factory Floor

We have a factory line with equipment, sensors, quality control, and AR to assist engineers, and AI to watch and intelligently aggregate data.  Incidentally, NATS works very well with the [Unity](https://unity.com/solutions/automotive-transportation-manufacturing) platform which is being applied to Industry 4.0.

 <img class="img-responsive center-block" src="/img/blog/synadia-adaptive-edge-iiot1.png" alt="A jpg showing a factory floor" height="400" width="600">

## Headquarters, Factories and Distribution Centers

In the big picture, we have headquarters, distribution centers, and factories.  Note that all of these are connected, and data is exchanged through NATS.  While not pictured, the flow and availability of data is dictated by accounts.  This is just a simple diagram; using the adaptive edge architecture supply chain can be included to provide services that can allow for optimization of logistics, inventory, and more.

 <img class="img-responsive center-block" src="/img/blog/synadia-adaptive-edge-iiot1.png" alt="A jpg showing a factories, warehouses, and headquarters" height="400" width="600">

## Application to Vertical Markets

|  Use Case | Central | Shared Services or Streams  | Remote Entity  | Endpoints |
| ------ | ------ | ------ | ------ | ----- |
| Connected Car | Headquarters |Location Services, Weather, Metrics, Security |Vehicle|Various systems within the vehicle|
| Manufacturing  | Regional, Divisional, or National Headquarters |Analytics, QA, Schematic updates, inventory|Factory|Line Equipment|
| Retail/Restaurant | Regional Headquarters |Points programs, Ad rewards, coupons, logistics|Stores/Distribution Centers|Scanners, POS devices, Inventory|
| Energy  |Headquarters and DR sites|Power source scheduling, outage recovery coordination, metrics|Microgrids, Wind Turbine sites, Feeder Lines, Mobile Substations|Photovoltaic, Turbines, Power boxes, Field diagnostics, Smart meters|
|Aviation|Supercluster of Airports |Weather, Socials, Air Traffic|Gates, Airplanes, Luggage|Airline systems, Gate software, Airport Apps|
| Cellular/Mobile | Headquarters + many regional clusters  |Thousands of services, from call blocking, forwarding to IoT specific services|Cell Towers (5g), Macrocell, Small Cell Sites|Web and phone applications, websites|
| Credit Card Services  |Each cluster in a regional headquarters and DR sites |Points programs, fraud detection, country specific value-added services|Regional or by location (brick and mortar)|Websites, Applications, POS devices|
| Maritime |Global Supercluster |Logistics, Manifest management, planned maintenance |Ship|Inventory management equipment, Location telemetry|
| Trucking  |Regional / International Supercluster |Dispatch Services, Maintenance, Fleet management services, Traffic Services|Vehicle|Location telemetry, component health (engine/tire management)|

# About the Author

I'm Colin Sullivan, Product Manager at Synadia as well a long time NATS maintainer.

At Synadia we see new use cases every day and are excited to help NATS users.  We are invested in NATS and love to see it help solve increasingly common problems.  If you're interested in learning more, contact us at info@synadia.com or myself directly at colin@synadia.com.
