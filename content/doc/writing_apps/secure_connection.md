+++
category = "api"
title = "Securing Connections"
[menu.main]
    name = "Securing Connections"
    weight = 3
    identifier = "connection-security"
    parent = "Writing Apps"
+++

NATS provides several forms of security for your messages. First, you can turn on authorization which limits access to the gnatsd server. Second, access to specific subjects can be controlled. Third, you can use TLS to encrypt traffic between clients and the server. Finally, TLS can be used to verify client identities using certificates. By combining all of these methods you can protect access to data and data in motion.

The client doesn't have control over access controls, but clients do provide the configurations required to authenticate with the server, and to turn on TLS.

## Server Authentication

There are two kinds of authentication in NATS, plus a third if you count certificate verification discussed below:

* User/Password
* Token

While the server can be configured to take either of these, we will use the command line in these examples to make things easy. See the server doc for more details on setting up that side.

For the user/password examples, start the server using:

```bash
> gnatsd --user myname --pass password
```

You can encrypt passwords to pass to `gnatsd` using a simple tool provided by the server:

```bash
> go run mkpasswd.go -p
> password: password
> bcrypt hash: $2a$11$1oJy/wZYNTxr9jNwMNwS3eUGhBpHT3On8CL9o7ey89mpgo88VG6ba
```

and use the hashed password in the server config. The client still uses the plain text version.

For the token examples, start the server using:

```bash
> gnatsd --auth mytoken
```

> The following examples use localhost:4222 so that you can start the server on your machine to try them out.

### Authenticating with a User and Password

When logging in with a password `gnatsd` will take either a plain text password or an encrypted password.

{{< partial "doc/connect_userpass.html" >}}

### Authenticating with a User and Password In the URL

Most clients make it easy to pass the user name and password by accepting them in the URL for the server. This standard format is:

> nats://_user_:_password_@server:port

Using this format, you can connect to a server using authentication as easily as you connected with a URL:

{{< partial "doc/connect_userpass_url.html" >}}

### Authenticating with a Token

Tokens are basically random strings, much like a password.

{{< partial "doc/connect_token.html" >}}

### Authenticating with a Token In the URL

Some client libraries will allow you to pass the token as part of the server URL using the form:

> nats://_token_@server:port

Again, once you construct this URL you can connect as if this was a normal URL.

{{< partial "doc/connect_token_url.html" >}}

## Encrypting Connections With TLS

While authentication limits which clients can connect, TLS can be used to check the server's identity, the client's identity and will encrypt the traffic between the two. The most secure version of TLS with NATS is to use verified client certificates. In this mode, the client can check that it trusts the certificate sent by the `gnatsd` but the server will also check that it trusts the certificate sent by the client. From an applications perspective connecting to a server that does not verify client certificates may appear identical. Under the covers, disabling TLS verification removes the server side check on the client's certificate. When started in TLS mode, `gnatsd` will require all clients to connect with TLS. Moreover, if configured to connect with TLS, client libraries will fail to connect to a server without TLS.

The [Java examples repository](https://github.com/nats-io/java-nats-examples/tree/master/src/main/resources) contains certificates for starting the server in TLS mode.

```bash
> gnatsd -c /src/main/resources/tls.conf
 or
> gnatsd -c /src/main/resources/tls_verify.conf
```

### Connecting with TLS

Connecting to a server with TLS is primarily an exercise in setting up the certificate and trust managers. For example:

{{< partial "doc/connect_tls.html" >}}

### Connecting with the TLS Protocol

Some clients may support the `tls` protocol as well as a manual setting to turn on TLS. However, in that case there is likely some form of default or environmental settings to allow the TLS libraries to find certificate and trust stores.

{{< partial "doc/connect_tls_url.html" >}}
