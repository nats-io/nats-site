+++
categories = ["Community", "Engineering"]
date = "2017-06-06"
tags = ["nats", "guest post", "kubernetes", "mean stack", "machine learning"]
title = "Guest Post: Real-time, high performance machine learning using NATS, Kubernetes, and MEAN Stack"
author = "Alejandro Esquivel"
+++

I am studying Physics at UBC (University of British Columbia), and am a Software Engineer at [Aida](https://helloaida.io/). Aida is an AI startup building a SaaS platform that provides fast, accurate, and automated assistance for customer support. Aida automatically learns questions and answers from past agent transactions and accurately responds to common support questions which typically account for 10%-30% of ticket volume. Unlike conventional chatbots, Aida does not rely on hand crafted, rule based templates which can only cope with a narrow range of inputs and is incredibly difficult to keep up to date. Our AI technology continuously learns, allowing enterprises to maintain accuracy as they change and grow without relying on onerous manual work.

Aida is the first touchpoint for customers who have support inquiries, so high availability is one of our core mantras. Consequently, we run on a Kubernetes architecture, and we wanted a reliable lightweight MQ service that could run within the cluster and act as a Message Bus between our Node.js microservices; thus high message throughput was an implicit requirement. In the Kubernetes domain, apps are intrinsically volatile, so we also needed message queue persistence for messages to be re-delivered both to avoid order dependence between services during our deployments, and during real time changes to our NLP models.

We’ve been using NATS in production ever since we launched our product, and we have been able to successfully roll out deployments as well as updates to our ML models. I first became familiar with NATS when reading about message [throughput comparisons](https://bravenewgeek.com/dissecting-message-queues/) with Redis Pub/Sub and RabbitMQ.

Aida's front-end and microservices architecture is built with the MEAN stack, and we use Redis as an in-memory session store. Our Machine Learning team uses Python for data analysis and in-house NLP models. Container orchestration is done by [Kubernetes](https://kubernetes.io/) and [Helm](https://github.com/kubernetes/helm) to manage our releases and charts. We use [NATS](https://www.nats.io) as a Message Bus between our Microservices.

We chose NATS as our Message Bus between our microservices, which effectively made it the backbone of our infrastructure. It allowed us to have robust at-least-once delivery, out of the box retry mechanism with manual acknowledgements for async jobs, and persistence (via NATS Streaming), which is great in the Kubernetes domain where applications can have tasks to work through during any given deployment. Ultimately, we felt NATS really facilitated our implementation of a production ready MQ, compared to others like RabbitMQ which would have added more engineering cost to do right. Another reason for choosing NATS was the high message throughput performance compared to other MQ’s and great client lib support.

We have created a basic Helm Chart for NATS Streaming, which we plan on extending and publishing soon to the open source community. Our hope is that a chart will be available on the official Kubernetes charts repo.

<img class="img-responsive center-block" alt="Architecture Diagram" src="/img/blog/real-time-high-performance-machine-learning-using-nats-kubernetes-and-mean-stack.jpg">

---

Helm Chart Snippet:

```
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: {{ template "fullname" . }}
  labels:
    chart: "{{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}"
spec:
  replicas: {{ .Values.replicaCount }}
  template:
    metadata:
      labels:
        app: {{ template "fullname" . }}
    spec:
      containers:
      - name: {{ .Chart.Name }}
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        imagePullPolicy: {{ .Values.image.pullPolicy }}
        command: ["/nats-streaming-server"]
        args:
        - "-m"
        - "{{.Values.service.internalPortMgt}}"
        - "--port"
        - "{{.Values.service.internalPortApp}}"
        - "--cluster_id"
        - "-DV"
        ports:
        - containerPort: {{ .Values.service.internalPortApp }}
          name: app
        - containerPort: {{ .Values.service.internalPortMgt }}
          name: mgt
        livenessProbe:
          httpGet:
            path: /
            port: {{ .Values.service.internalPortMgt }}
        readinessProbe:
          httpGet:
            path: /
            port: {{ .Values.service.internalPortMgt }}
        resources:
{{ toYaml .Values.resources | indent 12 }}
```

If you have any questions or want to know more, please reach out on [Github](https://github.com/AlejandroEsquivel) or [Linkedin](https://www.linkedin.com/in/alejandroesquiveltovar/), or find me in the [NATS Slack Community](https://docs.google.com/forms/d/e/1FAIpQLSd_MAN1MCDpSbZT7hrXmohGNpT0sUtxDCCOBJhmo_t2gvdHhQ/viewform)!
