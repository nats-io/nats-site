+++
title = "How Sophotech Cut Latency by 3x Migrating from RabbitMQ to NATS"
date = "2025-08-26"
author = "Synadia"
categories = ["Engineering","Guest-Post","Use Case","Community"]
+++

<img alt="Sophotech Logo" src="/img/blog/sophotech_logo.png" height="32" width="225">


After replacing RabbitMQ with NATS, [Sophotech](https://sopho.tech/) saw major improvements in performance and simplicity — here are their takeaways:

## High-level overview

Sophotech migrated their ~50-service cluster from RabbitMQ to NATS. The change cut p99 latency from ~150 ms to ~40 ms, reduced ops overhead from several hours a week to under one, and eliminated queue lag during bursts (minutes -> seconds). Simpler subject-based routing also removed the need for complex RabbitMQ topology, making the system easier to operate and scale.

## Context

- Single Kubernetes cluster, ~50 microservices  
- RabbitMQ used for task queues, pub/sub events, and service-to-service RPC  

## Problems with RabbitMQ

- High ops overhead (clustering, upgrades, monitoring)  
- Queues built up under burst load -> latency spikes  
- Complex topology for even simple pub/sub  

## Migration to NATS

- Adopted NATS Core for request-reply  
- Subjects replaced exchanges/queues with simpler naming scheme  
- Gradual migration: dual publishing, canary consumers, then cutover  

## Results

- **p99 latency:** ~150 ms → ~40 ms  
- **Ops time:** several hours/week → under 1 hour/week  
- **Throughput under bursts:** queues lagged minutes, with NATS they are now processed within seconds  
- **Simplicity:** no more shovels, mirrors, or heavy cluster tuning  

## About Sophotech

[Sophotech](https://sopho.tech/) provides strategic technology consulting in software architecture, DevOps, cybersecurity, compliance, and FinOps. Our seasoned consultants empower startups and enterprises to build scalable, secure, and optimized systems, enabling efficient growth and industry-leading innovation.
