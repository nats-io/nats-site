+++
title = "NATS Server Security"
description = ""
category = "server"
[menu.main]
  name = "Security/Encryption"
  weight = 4
  identifier = "doc-security"
  parent = "Managing the Server"
+++

As of Release 0.7.0, the server can use modern TLS semantics for client connections, route connections, and the HTTPS monitoring port.
The server requires TLS version 1.2, and sets preferences for modern cipher suites that avoid those known with vulnerabilities. The
server's preferences when building with Go1.5 are as follows.

```go
func defaultCipherSuites() []uint16 {
    return []uint16{
        // The SHA384 versions are only in Go1.5+
        tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
        tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
        tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
        tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
    }
}
```

Generating self signed certs and intermediary certificate authorities is beyond the scope here, but this document can be helpful in addition to Google Search:
<a href="https://docs.docker.com/engine/articles/https/" target="_blank">https://docs.docker.com/engine/articles/https/</a>

The server **requires** a certificate and private key. Optionally the server can require that clients need to present certificates, and the server can be configured with a CA authority to verify the client certificates.

```ascii
# Simple TLS config file

listen: 127.0.0.1:4443

tls {
  cert_file:  "./configs/certs/server-cert.pem"
  key_file:   "./configs/certs/server-key.pem"
  timeout:    2
}

authorization {
  user:     derek
  password: $2a$11$W2zko751KUvVy59mUTWmpOdWjpEm5qhcCZRd05GjI/sSOT.xtiHyG
  timeout:  1
}
```

If requiring client certificates as well, simply change the TLS section as follows.

```ascii
tls {
  cert_file: "./configs/certs/server-cert.pem"
  key_file:  "./configs/certs/server-key.pem"
  ca_file:   "./configs/certs/ca.pem"
  verify:    true
}
```

When setting up clusters, all servers in the cluster, if using TLS, will both verify the connecting endpoints and the server responses. So certificates are checked in both directions. Certificates can be configured only for the server's cluster identity, keeping client and server certificates separate from cluster formation.

```ascii
cluster {
  listen: 127.0.0.1:4244

  tls {
    # Route cert
    cert_file: "./configs/certs/srva-cert.pem"
    # Private key
    key_file:  "./configs/certs/srva-key.pem"
    # Optional certificate authority verifying connected routes
    # Required when we have self-signed CA, etc.
    ca_file:   "./configs/certs/ca.pem"
  }
  # Routes are actively solicited and connected to from this server.
  # Other servers can connect to us if they supply the correct credentials
  # in their routes definitions from above.
  routes = [
    nats-route://127.0.0.1:4246
  ]
}
```

The server can be run using command line arguments to enable TLS functionality.

```
--tls                        Enable TLS, do not verify clients (default: false)
--tlscert FILE               Server certificate file
--tlskey FILE                Private key for server certificate
--tlsverify                  Enable TLS, verify client certificates
--tlscacert FILE             Client certificate CA for verification
```

Examples using the test certicates which are self signed for localhost and 127.0.0.1.

```sh
> ./gnatsd --tls --tlscert=./test/configs/certs/server-cert.pem --tlskey=./test/configs/certs/server-key.pem

[2935] 2016/04/26 13:34:30.685413 [INF] Starting nats-server version 0.8.0.beta
[2935] 2016/04/26 13:34:30.685509 [INF] Listening for client connections on 0.0.0.0:4222
[2935] 2016/04/26 13:34:30.685656 [INF] TLS required for client connections
[2935] 2016/04/26 13:34:30.685660 [INF] Server is ready
```

Notice that the log  indicates that the client connections will be required to use TLS. If you run the server in Debug mode with -D or -DV, the logs will show the cipher suite selection for each connected client.

```sh
[15146] 2015/12/03 12:38:37.733139 [DBG] ::1:63330 - cid:1 - Starting TLS client connection handshake
[15146] 2015/12/03 12:38:37.751948 [DBG] ::1:63330 - cid:1 - TLS handshake complete
[15146] 2015/12/03 12:38:37.751959 [DBG] ::1:63330 - cid:1 - TLS version 1.2, cipher suite TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
```

If you want the server to enforce and require client certificates as well via the command line, utilize this example.

```sh
> ./gnatsd --tlsverify --tlscert=./test/configs/certs/server-cert.pem --tlskey=./test/configs/certs/server-key.pem --tlscacert=./test/configs/certs/ca.pem
```

### Using bcrypt to Protect Passwords

In addition to TLS functionality, the server now also supports hashing of passwords and authentication tokens using `bcrypt`. To take advantage of this, simply replace the plaintext password in the configuration with its `bcrypt` hash, and the server will automatically utilize `bcrypt` as needed.

A utility for creating `bcrypt` hashes is included with the gnatsd distribution (`util/mkpasswd.go`). Running it with no arguments will generate a new secure password along with the associated hash. This can be used for a password or a token in the configuration. 

```
~/go/src/github.com/nats-io/gnatsd/util> go build mkpasswd.go
~/go/src/github.com/nats-io/gnatsd/util> ./mkpasswd
pass: #IclkRPHUpsTmACWzmIGXr
bcrypt hash: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

If you already have a password selected, you can supply the `-p` flag on the command line, enter your desired password, and a `bcrypt` hash will be generated for it:
```
~/go/src/github.com/nats-io/gnatsd/util> ./mkpasswd -p
Enter Password: *******
Reenter Password: ******
bcrypt hash: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
```

Add the hash into the server configuration file's authorization section.

```
  authorization {
    user: derek
    password: $2a$11$3kIDaCxw.Glsl1.u5nKa6eUnNDLV5HV9tIuUp7EHhMt6Nm9myW1aS
  }
```
