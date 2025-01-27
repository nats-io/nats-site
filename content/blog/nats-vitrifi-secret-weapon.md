+++
title= "NATS.io: The Secret Weapon Behind Vitrifi’s Workflow Automation Platform"
categories = ["Engineering", "Community"]
author = "Vitrifi"
tags = ["nats", "use-case", "vitrifi"]
date= "2025-01-24"
+++

This is the first part of a two-part series explaining how Vitrifi leverages NATS.io to build its Workflow Automation Platform.

## Some Background for Perspective

At [Vitrifi](https://www.vitrifi.net/), we embarked on building a Workflow Automation Platform after discovering that existing solutions couldn’t meet our specific requirements. Our vision was clear - we needed a platform that would:

- Be fully BPMN 2.0 compatible
- Provide an intuitive interface for visually designing and simulating workflows
- Maintain a minimal footprint for deployment flexibility
- Dynamically scale task workers based on workload
- Support multi-cloud deployments with high resilience and scalability
- Process thousands of workflow states per minute with real-time status updates

When existing open-source workflow solutions fell short, we took action. This led to the creation of Shar, an open-source workflow engine developed by Crystal Construct with Vitrifi’s support. Shar became the foundation for our Workflow Automation Platform.


As we built out the UI, backend APIs, and additional services, one common architecture element emerged useful across all components: **NATS**.

<img src="/img/blog/vitrifi-automation-wf-arch.png" width="600" height="600">

### Key:

- **UI**: User Interface  
- **TS**: Trigger Server  
- **API**: Application Programming Interface  
- **Shar**: Workflow Engine  
- **DB**: Database  
- **TR**: Task Runner  

Our architecture is broken down into two primary sections: **Content Management** and **Core**.

### Content Management System (CMS)
This acts as the control center of the platform: users design tasks, create workflows, manage application settings, handle user administration, and monitor platform performance.

### Core Section
This is where workflows come to life. Three key components work together to execute tasks:
1. **Shar**: Interprets BPMN 2.0 files and orchestrates the execution of workflow processes and tasks.
2. **Trigger Server (TS)**: Connects to workflow execution message sources and transforms incoming messages into Shar-compatible workflow initiation commands.
3. **Task Runner (TR)**: Manages task workers on demand, scaling them up and down based on workload.

When users publish a workflow from the CMS, it transforms the workflow and its associated tasks into immutable objects and persists them to the Core using **NATS** as a key-value store. Additionally, the UI and API continuously receive real-time messages from NATS about workflow status updates.

## Leveraging NATS in Workflow Automation

NATS serves as our universal transport layer for all workflow automation tasks, but its capabilities extend far beyond basic message passing. For us, it’s a Swiss Army knife of distributed systems architecture, enabling everything from state management to cross-system integration.

### A Peek into How We Use NATS

Consider a likely real-world scenario where the Workflow Automation Platform is deployed in a multi-cloud pattern:

- The Content Management and Core sections run in a public cloud provider.
- Another Core deployment operates in a private datacenter.
- The NATS system spans both environments.

If the cloud deployment experiences issues, the private datacenter continues operations seamlessly. This is possible because the platform is fundamentally asynchronous, using events (messages) processed through NATS. The ability to extend NATS systems across deployments combined with the Core components’ sole use of NATS as the communication layer creates a natural resilience mechanism.

### 1. NATS as a Database

When we talk about NATS as a database, we’re really talking about its Key-Value store capabilities.  What makes it particularly powerful for our use case is its ability to handle distributed state with grace.  The store provides strong consistency guarantees within clusters while managing eventual consistency across our distributed deployments.

What really shines is the built-in revision tracking and real-time state monitoring.  Imagine being able to track every state change in your workflows while maintaining the ability to replay history when needed.  Add to that automatic key expiration and atomic operations, and you’ve got a robust foundation for state management.

We particularly value:
- The bucket-based organisation with hierarchical keys
- Built-in revision history tracking
- Robust and resilient high availability with replication. Cross-cluster - and cross location. 
- Real-time state monitoring through watch operations

### 2. NATS as a Message Streaming Platform

Our platform processes thousands of workflow states per minute, each generating multiple events that need reliable delivery and processing.  This is where NATS’ JetStream capabilities really shine.

The beauty of JetStream lies in its flexibility.  We can fine-tune everything from message retention to delivery patterns with integrated backpressure handling.

The ability of consuming messages in a push/pull consumer mode has proven to be a great addition to our toolset.  For example, for large volumes of messages, we choose a pull pattern which allows for lots of control.  Workflow state updates are a great example of this.

Push mode is used for discrete messages where creating the pull consumer logic is a bit of an overshoot and immediate action is required – think of pausing or cancelling a workflow execution due to an irrecoverable failure.

### 3. NATS for Exactly-Once Delivery

While implementing idempotent operations is still a best practice (and we do), NATS provides robust exactly-once delivery semantics that make our lives much easier.

This is particularly crucial for our Trigger Server component.  When a workflow trigger arrives, we absolutely need to ensure it executes once – no more, no less.  NATS handles this elegantly through a combination of message de-duplication, delivery tracking and acknowledgement mechanisms.

### 4. NATS as an Integration Gateway

In our design, we also use NATS as a central point for integration with other Vitrifi systems.  

Through features like leaf nodes and gateway connections, we can create sophisticated multi-region deployments while maintaining simplicity in our architecture.

Whilst our workflow automation platform is standalone, it is also part of Vitrifi’s wider portfolio of products. When integration with other systems is required, such as receiving messages from another NATS deployment or cluster, we leverage Leaf Nodes to facilitate seamless connectivity.

### 5. NATS as a Resource Management Hub

Due to its distributed nature and the features we’ve discussed, NATS is an excellent choice for a centralized but resilient backing store. We make extensive use of its request-reply pattern, which is elegantly simple: you send a request, and you receive a reply - all whilst preserving the loose coupling that underpins robust distributed systems.

For example, before running a workflow or task, we may need to validate certain conditions. Using the request-reply pattern for this purpose is straightforward and feels completely natural.

### 6. Handling Multi-Tenancy with NATS

As a SaaS platform, multi-tenancy is essential for our Workflow Automation Platform. NATS provides a robust security model that ensures true multi-tenant isolation without compromising performance or flexibility. Through the use of NATS account for tenant isolation and JWT-based authentication, we can guarantee that each tenant’s data and processing remain entirely separate while sharing the same infrastructure.

Harnessing the power of NATS goes beyond its individual features - it’s about how these capabilities integrate seamlessly. This synergy enables us to build a workflow automation platform that is both powerful and reliable while remaining surprisingly simple to operate and maintain.

## Final Thoughts

NATS has become more than just a component of our Workflow Automation Platform - it’s a fundamental piece of our architecture that enables extensibility, performance, flexibility, and resilience. As NATS continues to evolve, we’re excited to leverage more of its capabilities and push the boundaries of what’s possible in workflow automation.
The success of our platform’s architecture demonstrates that the best solution isn’t always about adding more components - it’s about choosing the right ones and using them to their full potential. For us, NATS has undoubtedly been that choice.

## Coming Up…

In the second part of this series, we’ll take a deep dive into Shar and explore how it leverages NATS’ powerful features to create a one-of-a-kind workflow engine.