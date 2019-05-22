# monitoring

+++ title = "Monitoring the NATS Server" aliases = \["documentation/server/gnatsd-monitoring/"\] description = "" category = "server" \[menu.main\] name = "Monitoring" weight = 10 identifier = "doc-monitoring" parent = "Managing the Server" +++

To monitor the NATS messaging system, `gnatsd` provides a lightweight HTTP server on a dedicated monitoring port. The monitoring server provides several endpoints, including [varz](monitoring.md#/varz), [connz](monitoring.md#/connz), [routez](monitoring.md#/routez), and [subsz](monitoring.md#/subz). All endpoints return a JSON object.

The NATS monitoring endpoints support JSONP and CORS, making it easy to create single page monitoring web applications.

## Enabling monitoring

To enable the monitoring server, start the NATS server with the monitoring flag `-m` and the monitoring port, or turn it on in the [configuration file](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/documentation/managing_the_server/configuration/README.md).

```text
-m, --http_port PORT             HTTP PORT for monitoring
-ms,--https_port PORT            Use HTTPS PORT for monitoring
```

Example:

```bash
$ gnatsd -m 8222
[4528] 2015/08/19 20:09:58.572939 [INF] Starting gnatsd version 0.8.0
[4528] 2015/08/19 20:09:58.573007 [INF] Starting http monitor on port 8222
[4528] 2015/08/19 20:09:58.573071 [INF] Listening for client connections on 0.0.0.0:4222
[4528] 2015/08/19 20:09:58.573090 [INF] gnatsd is ready</td>
```

To test, run `gnatsd -m 8222`, then go to [http://localhost:8222/](http://localhost:8222/)

## Monitoring endpoints

The following sections describe each supported monitoring endpoint: `varz`, `connz`, `routez`, and `subsz`.

### /varz

The endpoint [http://localhost:8222/varz](http://localhost:8222/varz) reports various general statistics.

```javascript
{
  "server_id": "ec933edcd2bd86bcf71d555fc8b4fb2c",
  "version": "0.6.6",
  "go": "go1.5.0",
  "host": "0.0.0.0",
  "port": 4222,
  "auth_required": false,
  "ssl_required": false,
  "max_payload": 1048576,
  "max_connections": 65536,
  "ping_interval": 120000000000,
  "ping_max": 2,
  "http_port": 8222,
  "ssl_timeout": 0.5,
  "max_control_line": 1024,
  "start": "2015-07-14T13:29:26.426805508-07:00",
  "now": "2015-07-14T13:30:59.349179963-07:00",
  "uptime": "1m33s",
  "mem": 8445952,
  "cores": 4,
  "cpu": 0,
  "connections": 39,
  "routes": 0,
  "remotes": 0,
  "in_msgs": 100000,
  "out_msgs": 100000,
  "in_bytes": 1600000,
  "out_bytes": 1600000,
  "slow_consumers": 0
}
```

### /connz

The endpoint [http://localhost:8222/connz](http://localhost:8222/connz) reports more detailed information on current connections. It uses a paging mechanism which defaults to 1024 connections.

You can control these via URL arguments \(limit and offset\). For example: [http://localhost:8222/connz?limit=1&offset=1](http://localhost:8222/connz?limit=1&offset=1).

You can also report detailed subscription information on a per connection basis using subs=1. For example: [http://localhost:8222/connz?limit=1&offset=1&subs=1](http://localhost:8222/connz?limit=1&offset=1&subs=1).

```javascript
{
  "now": "2015-07-14T13:30:59.349179963-07:00",
  "num_connections": 2,
  "offset": 0,
  "limit": 1024,
  "connections": [
    {
      "cid": 571,
      "ip": "127.0.0.1",
      "port": 61572,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "lang": "go",
      "version": "1.0.9",
      "subscriptions_list": [
        "hello.world"
      ]
    },
    {
      "cid": 574,
      "ip": "127.0.0.1",
      "port": 61577,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 1,
      "lang": "ruby",
      "version": "0.5.0",
      "subscriptions_list": [
        "hello.world"
      ]
    }
  ]
}
```

### /routez

The endpoint [http://localhost:8222/routez](http://localhost:8222/routez) reports information on active routes for a cluster. Routes are expected to be low, so there is no paging mechanism with this endpoint.

The `routez` endpoint does support the `subs` argument from the `/connz` endpoint. For example: [http://localhost:8222/routez?subs=1](http://localhost:8222/routez?subs=1)

```javascript
{
  "now": "2015-07-14T13:30:59.349179963-07:00",
  "num_routes": 1,
  "routes": [
    {
      "rid": 1,
      "remote_id": "de475c0041418afc799bccf0fdd61b47",
      "did_solicit": true,
      "ip": "127.0.0.1",
      "port": 61791,
      "pending_size": 0,
      "in_msgs": 0,
      "out_msgs": 0,
      "in_bytes": 0,
      "out_bytes": 0,
      "subscriptions": 0
    }
  ]
}
```

### /subsz

The endpoint [http://localhost:8222/subz](http://localhost:8222/subz) reports detailed information about the current subscriptions and the routing data structure.

```javascript
{
  "num_subscriptions": 3,
  "num_cache": 0,
  "num_inserts": 572,
  "num_removes": 569,
  "num_matches": 200000,
  "cache_hit_rate": 0.99999,
  "max_fanout": 0,
  "avg_fanout": 0,
  "stats_time": "2015-07-14T12:55:25.564818051-07:00"
}
```

## Creating monitoring applications

NATS monitoring endpoints support [JSONP](https://en.wikipedia.org/wiki/JSONP) and [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing#How_CORS_works). You can easily create single page web applications for monitoring. To do this you simply pass the `callback` query parameter to any endpoint.

For example:

```bash
http://localhost:8222/connz?callback=cb
```

Here is a JQuery example implementation:

```javascript
$.getJSON('http://localhost:8222/connz?callback=?', function(data) {
  console.log(data);
});
```

