+++
categories = ["engineering", "community"]
tags = ["gatling", "nats", "testing"]
date = "2016-10-19"
title = "Need to test your NATS application? Gatling might be the solution."
author = "Laurent Magnin"
+++

[NATS](http://nats.io) is about connecting different components: this allows you to test the components individually as well as their integration. As such, it’s essential to be able to generate and inject NATS messages. This is where a tool such as [Gatling](http://gatling.io) (an open-source load testing framework) is useful.

## The Missing Piece (Until Now)
To generate and send messages to NATS, you could use the [Java client for NATS (aka JNATS)](https://github.com/nats-io/jnats) by implementing your own Java code. However, in a complex ‘enterprise’ implementation you may start to generate a high volume of data required, or have complex integration scenarios in mind prior to deployment.

To make our lives easier, we at [Logimethods](http://logimethods.com) have developed the [NATS Gatling Connector](https://github.com/Logimethods/nats-connector-gatling/), a connector that can be embedded into [Gatling](http://gatling.io) to send messages to NATS & [NATS Streaming](http://nats.io/documentation/streaming/nats-streaming-intro/).

## Basic Usage
This NATS connector is available on [Maven Central](http://search.maven.org/#search%7Cga%7C1%7Cnats-connector-gatling). It provides a new Gatling “Protocol” (the archetype of such protocols being an [http connection](http://gatling.io/docs/2.1.7/http/http_protocol.html)), which can be used through “Gatling scenarios”, such as in the following code:

```scala
class NatsInjection extends Simulation {
  val properties = new Properties()
  properties.setProperty(io.nats.client.Constants.PROP_URL, "nats://localhost:4222")
  val natsProtocol = NatsProtocol(properties, "GatlingSubject")
  val natsScn = scenario("NATS call").exec(NatsBuilder("Message from Gatling!"))
  setUp(
    natsScn.inject(constantUsersPerSec(15) during (1 minute))
  ).protocols(natsProtocol)
}
```

The above code is divided into three parts:

  1. The NatsProtocol that describes the (permanent) connection to NATS.
  2. The natsScn scenario (based on NatsBuilder), which defines the individual messages sent to NATS.
  3. Finally, the setup that specifies the orchestration of the calls to natsScn scenario, under the control of the previously defined natsProtocol.

Take note that, in order to send messages through the [NATS Streaming protocol](https://nats.io/documentation/streaming/nats-streaming-intro/), you should instead use  NatsStreamingProtocol & NatsStreamingBuilder:

```scala
val natsProtocol = NatsStreamingProtocol("nats://localhost:4222", clusterID, subject)
val natsScn = scenario("NATS call").exec(NatsStreamingBuilder("Message from Gatling!"))
```

As you may have noticed, the code is written in [Scala](http://www.scala-lang.org), the native language of Gatling. This improves performance and parallelism (thanks to [Akka](http://akka.io) & [Netty](http://netty.io)). A good incentive to try that language (at least one of the multiple DSL builds on top of it) for those of you who haven’t yet!

## More Advanced Usages
Thanks to the Gatling’s flexibility, you can also develop [more complex scenarios](http://gatling.io/docs/2.1.7/advanced_tutorial.html).

For example, it’s possible to generate NATS messages that may change over time: the NatsBuilder & NatsStreamingBuilder API accepts not only String, but also any type of instances from which the call to the toString() method will generate the actual messages.

Let see how we could generate loops of values between 100 to 150 with a 10 increment:

```scala
import akka.actor.{ActorRef, Props}
import io.gatling.core.Predef._
import io.gatling.core.action.builder.ActionBuilder
import io.gatling.core.config.{Protocol, Protocols}
import com.logimethods.nats.connector.gatling._

import scala.concurrent.duration._
import java.util.Properties
import io.nats.client.Constants.PROP_URL

class NatsInjection extends Simulation {

  val properties = new Properties()
  // The URI of the NATS server is provided by an environment variable:
  // >export NATS_URI=nats://nats-main:4222
  val natsUrl = System.getenv("NATS_URI")
  properties.setProperty(io.nats.client.Constants.PROP_URL, natsUrl)

  // The NATS Subject is also provided by an environment variable:
  // >export GATLING.TO_NATS.SUBJECT=FROM_GATLING
  var subject = System.getenv("GATLING.TO_NATS.SUBJECT")

  if (subject == null) {
    println("No Subject has been defined through the 'GATLING.TO_NATS.SUBJECT' Environment Variable!!!")
  } else {
    println("Will emit messages to " + subject)
    val natsProtocol = NatsProtocol(properties, subject)

    // The messages sent to NATS will not be constant thanks to the ValueProvider.
    val natsScn = scenario("NATS call").exec(NatsBuilder(new ValueProvider()))

    setUp(
      natsScn.inject(constantUsersPerSec(15) during (1 minute))
    ).protocols(natsProtocol)
  }
}

/**
 * The ValueProvider will generate a loop of values: 100, 110, 120, 130, 140, 150, 100...
 */
class ValueProvider {
  val incr = 10
  val baseValue = 100 -incr
  val maxIncr = 50
  var actualIncr = 0

  override def toString(): String = {
    actualIncr = (actualIncr % (maxIncr + incr)) + incr
    (baseValue + actualIncr).toString()
  }
}
```

The NATS URI and the NATS Subject are provided here through environment variables. This is convenient when you embed your code into [Docker Images](https://www.docker.com), as we did for the [docker-nats-connector-spark project](https://github.com/Logimethods/docker-nats-connector-spark/tree/version_0.1.0) in order to test the Gatling to NATS Connector, in conjunction with NATS to [Spark](http://spark.apache.org/docs/1.5.2/), then [Spark to NATS connectors](https://github.com/Logimethods/nats-connector-spark) (also developed by us). This application is defined as a composition of Docker Containers (you might also have a look at the [Docker Compose + NATS: Microservices Development Made Easy](http://nats.io/blog/docker-compose-plus-nats/) blog):

![Blog Image](/img/blog/testing-your-nats-application/testing-nats-01.png "Blog Image")

The build of all of those components is fully automated, through Gihub, [Wercker](http://wercker.com), Nexus & finally Docker Hub…

![Blog Image](/img/blog/testing-your-nats-application/testing-nats-02.png "Blog Image")

## How did we implement that connector?
We might have followed an approach based on the official [NATS Connector Framework](https://github.com/nats-io/nats-connector-framework), as the [NATS Redis Publish Subscribe Connector](https://github.com/nats-io/nats-connector-redis) does.

However, in our case, we don’t need to build a bridge between two platforms, but to develop pure Gatling components that are able to send messages to NATS & NATS Streaming. That’s why we got our inspiration from the brilliant [Write a Custom Protocol for Gatling](https://www.trivento.io/write-custom-protocol-for-gatling/) blog, combined with the (also excellent!) [NATS - Java client](https://github.com/nats-io/jnats/) & [NATS Streaming Java Client](https://github.com/nats-io/java-nats-streaming). Actually, all the code of this connector (except the tests, build, etc.) is defined by only two files, [NatsAction.scala](https://github.com/Logimethods/nats-connector-gatling/blob/master/src/main/scala/com/logimethods/connector/gatling/to_nats/NatsAction.scala) (which, by the way, needed a [major refactoring](https://github.com/Logimethods/nats-connector-gatling/blob/master/src/main/scala/com/logimethods/connector/gatling/to_nats/NatsAction.scala) to be compatible with Gatling version 2.2.2) & [NatsStreamingAction.scala](https://github.com/Logimethods/nats-connector-gatling/blob/master/src/main/scala/com/logimethods/connector/gatling/to_nats/NatsStreamingAction.scala).

The code of the [Gatling to NATS Connector](https://github.com/Logimethods/nats-connector-gatling/) is Open Source (Copyright (c) 2016 Logimethods, under the MIT License), hosted by Github.

---

## About the Author
[Laurent Magnin](https://ca.linkedin.com/in/lmagnin) is a Senior Consultant at Logimethods with a strong expertise in various domains (Big Data, BRMS, etc.). He holds a Ph.D. in Artificial Intelligence from the University of Paris VI (France).

[Logimethods](http://logimethods.com) is a highly specialized consulting firm providing Enterprise Architecture, Enterprise Integration and Business Intelligence services to large organizations to help them:

  - Align, simplify and integrate their IT environment for greater efficiency and asset reuse, and
  - Achieve higher levels of process performance.

Logimethods is headquartered in Montreal, with offices in Toronto, Calgary, Victoria and Chicago.
