+++
date = "2016-06-23"
title = "Server Authorization"
description = ""
category = "server"
[menu.documentation]
  name = "Server Authorization"
  weight = 3
  identifier = "server-gnatsd-authorization"
  parent = "server"
+++

The latest release of the NATS Server (0.9.0) supports user/client authorization using subject-level permissioning.

Subject-level permissioning is available with multi-user authentication configurations and leverages configuation variables. You enable multi-user authentication and permissioning using a NATS Server configuration file that defines the user credentials and permissions.

## Usage

Each permission grant is an object with two fields: what subject(s) the authenticated user can publish to, and what subject(s) the authenticated user can subscribe to. Authorization filters (subjects) can be a singleton or an array. Subjects can contain wildcards.

```
PERMSSION_NAME      // Variable
publish             // Singleton or array
subscribe           // Singleton or array
```

## Example

For example, since Alice is an ADMIN she can publish/subscribe on any subject. We use the wildcard “>” to match any subject.

```
authorization {
  ADMIN = {
    publish = ">"
    subscribe = ">"
  }
}
```

Bob is REQUESTOR and can publish requests on subjects req.foo or req.bar, and subscribe to anything that is a response (_INBOX.*).

```
authorization {
  REQUESTOR = {
    publish = ["req.foo", "req.bar"]
    subscribe = "_INBOX.*"
  }
}
```

Note that the publish field is an array with two subjects; the subscribe field is a singleton. The parser is generous at understanding what the intent is, so arrays and singletons are processed.

Joe has no permission grant and therefore inherits the default permission set. You set the inherited default permissions by assigning them to the default_permissions entry inside of the authorization configuration block.

```
authorization {
  default_permissions = {
    publish = "SANDBOX.*"
    subscribe = ["PUBLIC.>", "_INBOX.>"]
  }
}
```

Note that `_INBOX.*` subscribe permissions must be granted in order to use the request APIs in the Apcera supported clients. If an unauthorized client publishes or attempts to subscribe to a subject, the action fails and is logged at the server, and an error message is returned to the client.

## Complete example

```
authorization {
  
  ADMIN = {
    publish = ">"
    subscribe = ">"
  }
  
  REQUESTOR = {
    publish = ["req.foo", "req.bar"]
    subscribe = "_INBOX.*"
  }
  
  DEFAULT_PERMISSIONS = {
    publish = "SANDBOX.*"
    subscribe = ["PUBLIC.>", "_INBOX.>"]
  }
  
  PASS: abcdefghijklmnopqrstuvwxwz0123456789
  
  users = [
    {user: alice, password: foo, permissions: $ADMIN}
    {user: bob,   password: bar, permissions: $REQUESTOR}
    {user: joe,   password: $PASS}
  ]
}
```

Note that the variable identifier (name) is not case sensitive, but is capitalized by convention for readability. The variable is referenced using the $ character.