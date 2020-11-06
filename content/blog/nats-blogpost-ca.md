NATS and Certificate Authorities: Intermediate Rolls
====================================================

The NATS Server [can make good use of TLS](https://docs.nats.io/nats-server/configuration/securing_nats/tls)
for securing various connections, including some modes where NATS servers talk
directly to each other. When you configure the server to verify the certificate of a peer, you provide
a path to a Certificate Authority bundle file, to act as a trust anchor.  So
far, so normal.

In environments such as Kubernetes, it's common for a certificate management
process to create a Kubernetes secret, containing a key, a certificate, and a
copy of the issuer's certificate as `ca.pem`.  So far, so normal.

So let's take a look at
[Let's Encrypt](https://letsencrypt.org/):
not because they're doing anything wrong, but because their clear and open
communication means that we know about an upcoming event:
[Let's Encrypt is about to start using a new root and new intermediates](https://letsencrypt.org/2020/09/17/new-root-and-intermediates.html). When your certificate authority issues a certificate with a different
intermediate, your Kubernetes secret will hold that different intermediate in
the `ca.pem` field. So far so normal.

Now, in NATS, if you set up a cluster in Kubernetes, you're probably using
internal hostnames for the clustering and you'll be using a local
cluster-specific Certificate Authority for issuing certificates.  If you want
to change the cluster's CA for whatever reason, you can make sure that your
issuer returns more than one certificate in the CA field. But what happens if you have NATS running in two or more distinct clusters,
perhaps geographically diverse? Now you'll be using the Gateways feature, and using public hostnames.  You'll
need a certificate for those names.  A cluster-specific CA won't cut it.

If you have an in-house CA which can issue certificates, you can certainly
choose to use that.  But what if you also need certificates which client apps
can validate?  It's certainly reasonable to reuse the same certificate for
cluster-to-cluster communications as for client connections, when the same
identities are being asserted. So you have clusters A, B and C, all talking to each other with Gateways, and
you have a Let's Encrypt certificate, perhaps in a Kubernetes secret.  What do
you set as a Certificate Authority for validating peers? The simple, but very very wrong, answer is to use the CA which signed your own
cert.  This is even what our own `nats-operator` encouraged, until now.  It's
so obvious, and simple is better than complex.  It's so obvious, that's what
we originally configured ourselves.

One day very soon, Let's Encrypt will issue certificates using the R3
Intermediate instead of X3.  In fact, at any moment, without notice, they
could switch from X3 to X4 because of a security problem with X3: this is
fundamentally the very reason that LE issues their intermediates in pairs, to
have a standby which can be trusted in the event of a compromise. The first time one of the management layers of one of your NATS clusters, in your
supercluster, tries to renew its certificates after that change, it will get a
certificate from a different intermediate Certificate Authority.  Let's say
this is cluster B.  When the NATS server is reloaded with the new data:

 1. The new ca.pem value in the Kubernetes secret means that this cluster B
    will no longer trust the certificates of clusters A or C
 2. The different CA of B will not be in the trusted list of clusters A or C.
 3. Both sides will hard-schism from each other, and supercluster peering will
    break.

The solution to this is to **not use the ca.pem of the issued K8S secret as
the trust for inter-cluster peering**. Instead, decide what _set of certificate authorities_ should be considered as
valid for peer clusters.  Create a new bundle file containing all of those,
one after another, and use that for NATS to verify gateways. For instance, you might use a Kubernetes configMap or secret to hold a
`cabundle.pem` file, volume-mount this into your NATS servers' pods and ensure
that the NATS servers use this path for verifying gateway peers.

If using the
[NATS Operator](https://github.com/nats-io/nats-operator)
then make sure that you're on version 0.7.5 or newer and take a look at the
[README](https://github.com/nats-io/nats-operator#nats-operator) of that project for an example of how to configure this.

The migration is easy and involves no extra downtime beyond the usual for a
reload or pod restart: you create a bundle which includes the same CA as
present, and repoint to that bundle file.  Everything which can peer now, will
still be able to peer; but now you won't live in fear of an X4 or R3 roll. This same principle applies to any server-to-server communications, across any
protocol, using restricted sets of trust anchors.  If you're using DANE or any
form of CA pinning, make sure you update your trust anchors for those
environments too.

Happy CA Rollovers,
-Phil

## About the Author
Phil Pennock is a NATS Maintainer and a member of the engineering team at [Synadia Communications](https://synadia.com).
