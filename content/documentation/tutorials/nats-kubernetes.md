+++
date = "2017-09-07"
title = "Using NATS with Kubernetes"
description = ""
category = "tutorials"
[menu.main]
  name = "Using NATS with Kubernetes"
  weight = 4
  identifier = "tutorial-nats-kubernetes"
  parent = "Tutorials"
+++

# Using NATS with Kubernetes

NATS and Kubernetes are extremely popular together. Both are cloud native systems designed to handle modern, distributed workloads. There are a variety of methods you can use to run NATS and Kubernetes - including many examples from the broader developer community. We are going to take a look at some of those below.

## Running a NATS Cluster on top of Kubernetes
One of the core contributors to Kubernetes ([Paolo Pires](https://github.com/pires)) has also been a long-time user and contributor to NATS. Thankfully, a lot of his work has made it easier to run NATS on Kubernetes. You can follow his excellent Readme, [here](https://github.com/pires/kubernetes-nats-cluster) to get going - just pay attention to the pre-requisites, and make sure you run the latest version(s) of NATS and Kubernetes.

## Running NATS Streaming on a Kubernetes Cluster
There are several examples available with some nice tooling, one we've seen used recently is available [here](https://github.com/canhnt/k8s-nats-streaming). This repo will allow you to run NATS Streaming on a Docker Image, and invoke Helm. It takes advantage of recent updates to NATS Streaming to provide Fault Tolerance via Shared Storage, and the Helm chart is quite straightforward.
