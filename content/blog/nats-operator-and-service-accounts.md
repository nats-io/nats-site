+++
categories = ["engineering"]
date = "2018-07-19"
tags = ["kubernetes", "operators"]
title = "NATS Operator: Integrating Kubernetes ServiceAccounts for operated NATS clusters"
author = "Waldemar Quevedo"
+++

The latest release of the [NATS Operator](https://github.com/nats-io/nats-operator) has alpha support to configure
the authorization rules for an operated NATS cluster, via
[CustomResourceDefinitions](https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/), by using Kubernetes [ServiceAccounts](https://kubernetes.io/docs/reference/access-authn-authz/service-accounts-admin/) present
in a namespace.

In this blog post, we will explain how to use this feature along with
details of the internals on how it currently works.

<img class="img-responsive center-block" src="https://user-images.githubusercontent.com/26195/42645289-7f248028-85b2-11e8-8999-686d4d7d8864.png">

### Getting started

In order to use the ServiceAccounts mapped accounts for an operated NATS cluster, you will need at minimum, a Kubernetes v1.10 cluster with [TokenRequest API](https://github.com/kubernetes/community/blob/4a41674f6fb6fa69b3dfaf15267d908e909685d7/contributors/design-proposals/auth/bound-service-account-tokens.md) and [PodShareProcessNamespace](https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/) flags enabled.

You can try the feature with `minikube` by enabling the feature flags as follows:

```sh
minikube start \
  --feature-gates="TokenRequest=true,PodShareProcessNamespace=true" \
  --extra-config=apiserver.service-account-signing-key-file=/var/lib/localkube/certs/apiserver.key \
  --extra-config=apiserver.service-account-issuer=api \
  --extra-config=apiserver.service-account-api-audiences=api \
  --extra-config=apiserver.service-account-key-file=/var/lib/localkube/certs/sa.pub
```

Note that in order to activate the `TokenRequest API`, it is necessary
to specify a number of `extra-config` flags besides toggling the
feature flag, otherwise the NATS Operator would get 404s when calling
the API and not be able to issue tokens.

Next, let's deploy the latest version of the [NATS Operator v0.2.3](https://github.com/nats-io/nats-operator/releases/tag/v0.2.3)
with the defined [RBAC](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) policy:

```
$ kubectl apply -f https://github.com/nats-io/nats-operator/releases/download/v0.2.3/deployment-rbac.yaml
namespace/nats-io configured
serviceaccount/nats-operator unchanged
deployment.apps/nats-operator created
clusterrolebinding.rbac.authorization.k8s.io/nats-io:nats-operator-binding configured
clusterrole.rbac.authorization.k8s.io/nats-io:nats-operator configured
```

Now we can create an operated NATS cluster in the `nats-io` namespace
using the ServiceAccounts integration by toggling the
`enableServiceAccounts` flag as part of the `NatsCluster` spec.  In
order to support configuration changes on-the-fly for the cluster, we
toggle `enableConfigReload` as well.

```yaml
---
apiVersion: nats.io/v1alpha2
kind: NatsCluster
metadata:
  name: example-nats
spec:
  size: 3
  version: "1.2.0"
  pod:
    enableConfigReload: true
  auth:
    enableServiceAccounts: true
```

In the [nats-operator](https://github.com/nats-io/nats-operator/) repository there is a [complete example](https://github.com/nats-io/nats-operator/blob/84d06026c70412e172335e673b1dffad33fe66c1/example/example-cluster-service-accounts.yaml) of creating a
NATS cluster with service accounts defined for it, so let's deploy
that and take a look at the result:

```sh
$ kubectl -n nats-io apply -f https://raw.githubusercontent.com/nats-io/nats-operator/master/example/example-cluster-service-accounts.yaml
natscluster.nats.io/example-nats created
serviceaccount/nats-admin-user created
serviceaccount/nats-user created
nnatsservicerole.nats.io/nats-user unchanged
natsservicerole.nats.io/nats-admin-user unchanged
pod/nats-user-pod created
pod/nats-admin-user-pod created
```

As it can be seen from the output, the command above has created a couple
of service accounts, one for a `nats-user` and another one for a
`nats-admin-user`, as well as a couple of `natsservicerole` objects with
the same names.  The `NatsServiceRole` is a new
`CustomResourceDefinition` that the NATS Operator creates to represent
a `ServiceAccount` that will be used by a NATS cluster.

For example, in the case of the `nats-user`, a `NatsServiceRole` is
defined as below so the `example-nats` cluster created by the operator
sets PUB/SUB permissions for that account:

```yaml
---
apiVersion: v1
kind: ServiceAccount
metadata:
  name: nats-user
---
apiVersion: nats.io/v1alpha2
kind: NatsServiceRole
metadata:
  name: nats-user
  namespace: nats-io

  # Specifies which NATS cluster will be using this role.
  labels:
    nats_cluster: example-nats
spec:
  permissions:
    publish: ["foo.*", "foo.bar.quux"]
    subscribe: ["foo.bar", "greetings", "hello.world"]
```

The NATS Operator will then detect a mapping between a NatsServiceRole and a ServiceAccount and issue a new token where the audience is set to be the operated NATS cluster service and store it in a secret.

```sh
kubectl -n nats-io get secret nats-user-example-nats-bound-token  -o yaml
apiVersion: v1
data:
  token: ZXlKaGJHY2lPaUpTVXp...
kind: Secret
metadata:
  creationTimestamp: 2018-07-20T00:48:25Z
  labels:
    app: nats
    nats_cluster: example-nats
  name: nats-user-example-nats-bound-token
  namespace: nats-io
```

In order to use the `nats-user` account, a Pod can now mount the secret as a volume to use that token to authenticate:

```yaml
---
apiVersion: v1
kind: Pod
metadata:
  name: nats-user-pod
  labels:
    nats_cluster: example-nats
spec:
  volumes:
    - name: "token"
      projected:
        sources:
        - secret:
            name: "nats-user-example-nats-bound-token"
            items:
              - key: token
                path: "token"
  restartPolicy: Never
  containers:
    - name: nats-ops
      command: ["/bin/sh"]
      image: "wallyqs/nats-ops:latest"
      tty: true
      stdin: true
      stdinOnce: true

      # Service Account Token is mounted via projected volume.
      volumeMounts:
      - name: "token"
        mountPath: "/var/run/secrets/nats.io"
        readOnly: true
```

Using `kubectl attach` we can run a few commands in that container to confirm the permissions have been applied to the cluster:

```sh
kubectl -n nats-io attach -it nats-user-pod
...
/go # nats-sub -s nats://nats-user:`cat /var/run/secrets/nats.io/token`@example-nats:4222 hello.world
Listening on [hello.world]
^C
^C
/go # nats-sub -s nats://nats-user:`cat /var/run/secrets/nats.io/token`@example-nats:4222 hi
nats: permissions violation for subscription to "hi"
/go # nats-sub -s nats://nats-user:`cat /var/run/secrets/nats.io/token`@example-nats:4222 foo.bar
Listening on [foo.bar]
```

Since config reload was enabled, at any time we can update the
authorization configuration for the cluster and modify the
permissions.  For example, if the `NatsServiceRole` is deleted while a
client is connected, then the client will be disconnected from the
cluster since the account is no longer valid:

```sh
$ kubectl -n nats-io delete natsservicerole nats-user
natsservicerole.nats.io "nats-user" deleted

# (in the attached container)
/go # nats-sub -s nats://nats-user:`cat /var/run/secrets/nats.io/token`@example-nats:4222 hello.world
Listening on [hello.world]
Got disconnected!
```

Similarly, we can modify the permissions in the `NatsServiceRole` and the servers will update
the permissions and reload. Config reload events can be confirmed from the logs from a NATS server.

```sh
kubectl -n nats-io logs example-nats-1 nats
...
[6] 2018/07/19 01:05:43.469246 [INF] Reloaded server configuration
```

### How it works

As previously mentioned, the current implementation of the integration
relies on the `TokenRequest` and `PodShareProcessNamespace` alpha
features made available in the Kubernetes v1.10 release.

The [TokenRequest API](https://github.com/kubernetes/community/blob/4a41674f6fb6fa69b3dfaf15267d908e909685d7/contributors/design-proposals/auth/bound-service-account-tokens.md) feature allows the issuance of new tokens related
to a `ServiceAccount` but with a different audience as the one used for
the API server. _Customizing the audience_ is very important in this
case, since using the bare original token from `ServiceAccount` can
make us run into security issues since this means that any container
with the token would have the same permissions to get access to the
Kubernetes API.

```go
// Issue token with audience set for the NATS cluster in this namespace only,
// this will prevent the token from being usable against the API Server.
ar := &authenticationv1.TokenRequest{
	Spec: authenticationv1.TokenRequestSpec{
		Audiences: []string{fmt.Sprintf("nats://%s.%s.svc", clusterName, ns)},
        // ...
	},
}
tr, err := kubecli.ServiceAccounts(ns).CreateToken(sa.Name, ar)
if err != nil {
	return err
}
```

This token is then stored in a secret which can be mounted by a Pod
(relatedly, there is a new feature in Kubernetes v1.11 called [Service
Account Volume Projections](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#service-account-volume-projection) which would make it possible to not have to
rely on a secret). Then the configuration of the NATS Server is
updated including the newly mapped ServiceAccount + NatsServiceRole.

To be able to update the configuration of a cluster with zero-downtime,
assuming the [PodShareProcessNamespace](https://kubernetes.io/docs/tasks/configure-pod-container/share-process-namespace/) feature flag has been enabled,
the NATS Operator will enable the `ShareProcessNamespace` flag for each
one of the NATS Pods.

```go
// Enable PID namespace sharing and attach sidecar that
// reloads the server whenever the config file is updated.
if cs.Pod != nil && cs.Pod.EnableConfigReload {
	pod.Spec.ShareProcessNamespace = &[]bool{true}[0]
	// ...
}
```

Usually when running the NATS Server in Docker, it would run as PID 1
inside of the container but in this case since PID namespace sharing
has been enabled it is logging that the PID is `6` as shown below:

```
kubectl -n nats-io logs example-nats-1 nats | head
[6] [INF] Starting nats-server version 1.2.0
[6] [INF] Git commit [6608e9a]
[6] [INF] Starting http monitor on 0.0.0.0:8222
[6] [INF] Listening for client connections on 0.0.0.0:4222
[6] [INF] Server is ready
[6] [INF] Listening for route connections on 0.0.0.0:6222

```

Using `kubectl` we can confirm there are `2/2` containers running for each
one of the pods as well (nats server + reloader sidecar).

```
kubectl -n nats-io get pods -l nats_cluster=example-nats
NAME                    READY     STATUS    RESTARTS   AGE
example-nats-1          2/2       Running   0          4h
example-nats-2          2/2       Running   0          4h
example-nats-3          2/2       Running   0          4h
```

Whenever the operator applies updates to the shared secret with the
configuration of the roles, the reloader sidecar will detect the
change in the mounted shared secret volume and send the HUP signal to the
NATS server so eventually all the servers have the same configuration.

### Conclusions

Although these features are currently labeled as alpha, they are close
to being the proper way to handle these issues natively in Kubernetes
in a relatively simple way without having to make further changes to
the NATS Server.

Another interesting feature that is also worth looking at from latest
Kubernetes v1.11 release, is the [Service Account Volume Projections](https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/#service-account-volume-projection)(proposal doc [here](https://github.com/mikedanese/community/blob/2bf41bd80a9a50b544731c74c7d956c041ec71eb/contributors/design-proposals/storage/svcacct-token-volume-source.md)),
that improves the usability of mounting bound tokens for users.

With this feature, a Pod could be defined to use a certain service
account, then as part of it's spec, define the volume which will
contain the token making it unnecessary to have an extra
`Secret`. Plus, there is the added benefit of having a single identity
set for each one of the Pod workloads, instead of a single shared
secret for all of the NATS client pods as it is in the current
implementation.

```
apiVersion: v1
kind: Pod
metadata:
  name: nats-client-pod
spec:
  serviceAccountName: "nats-user"
  volumes:
    - name: "token"
      projected:
        sources:
        - serviceAccountToken:
            audience: "nats://example-nats.nats-io.svc"
            path: "token"
```

Although requested previously, the current release of the NATS server
does not natively support JWT based authorization, but this feature
looks like a promising extension point that could be used together
alongside the `TokenReview API`.
