+++
categories = ["Community", "Engineering"]
date = "2017-08-16"
tags = ["nats", "guest post", "rapidloop", "opsdash", "resiliency"]
title = "Guest Post: Alchemy's twist on the agile scrum board, using NATS."
author = "Jose Manuel Pita"
+++

<img class="img-responsive center-block" alt="Alchemy and NATS" src="/img/blog/alchemys-twist-on-the-agile-scrum-board-using-nats/02.jpg"><br>

Alchemy is an in house trading platform built for Standard Bank South Africa’s structured solutions desk.

The system was introduced to give the desk the ability to book exotic trade types in as short a time period as possible. Exotic trades as opposed to vanilla trades are complex in nature, the quantitative models in integration of those models usually take months to glue together… enter Alchemy.

An agile software development approach fits the scenario best and allows incremental development of products or trades into alchemy. One of the tools mostly used by our team is the lonely Scrum board. Having a board put up close to the developers ensures all developers know exactly what every other developer is busy with and if any delays may be creeping in during an agile sprint.
The board is a powerful tool when kept up to date and synchronized with 3rd party solutions such as Jira or Rally Dev. This synchronization sometimes takes 1 developer or a scrum master a few hours per day, being developers and being inherently lazy this was not acceptable, so we came up with two solutions that may solve our synchronization woes.

## Solution 1 (Touch Screen)
Replace the scrum board with a digital board i.e. a touch screen monitor and simply display what is already displayed in jira … BORING!
This also means someone still needs to manage Jira or Rally Dev. The development team rarely need to log into Jira that task is usually reserved for upper management that have a keen interest in the teams burn down rate and other management stats. We wanted a solution that could completely abstract our Task Board from the digital realm of Jira and Rally Dev… kinda strange for developers wanting to exist the digital realm.

## Solution 2 (Story tracking – TRAC Board)
Keep the scrum board and completely abstract it from Jira or Rally Dev, by using a camera with some clever code to track user stories on the board and which swimlanes the belong to. The camera can then feed the information to a service, our in our case an array of services that track the stories and synchronize them with the digital systems (Jira and Rally Dev). This we called the TRAC board, TRackable Agile Cards board.

## Solution 2... the winner for the alchemists
Solution 2 was the winner in our books so we set out to build the system which would contain the following key services:

- **Image processing**
- **Synchronization** – Synchronize the trac board with JIRA and other 3rd party software
- **Action** – Attach an event to a task state, for example send a tweet when a task is moved to a completed state
- **Deployment** – Triggered by the action service this service deploys a solution to an environment using an existing continuous deployment service like Jenkins.
- **Notification** – Our tweet'er / emailer / sms'er service

All the Communication between all these services would off course be handled by [NATS.io](https://www.nats.io).

We're going to focus on the implementation of the message processor service since this is the only service written in java the rest are all GO-Lang services.

## The Workflow
- Snap the agile board using a pi cam
- Processes image and extract lanes and story id’s
- Place story data on the NATS.io bus
- Synchronize the story location with JIRA
- Perform any action if required (send tweet)
- Deploy application changes

<img class="img-responsive center-block" alt="Alchemy and NATS" src="/img/blog/alchemys-twist-on-the-agile-scrum-board-using-nats/03.jpg">

## Image Processing Service
The Image processing service runs on a Raspberry pi zero, and as the name suggests is responsible for capturing an image of the agile board (TRAC board) and deciphering which lane the card resides and what the user story ID is. The ID is later mapped to an actual task description. Once the image is processed it is published on the NATS.io service.
Image processing was written in java which made it simple to port to an android app. This also meant we could use the NATSConnectorPlugin which makes it extremely easy to publish or subscribe to NATS.io.

```java
class TracBoard implements NATSConnectorPlugin
```

### NATSConnectorPlugin Interface
```java
public interface NATSConnectorPlugin {
  public boolean onStartup(Logger logger, ConnectionFactory factory);
  public boolean onNatsInitialized(NATSConnector connector);
  public void onNATSMessage(io.nats.client.Message msg);
  public void onNATSEvent(NATSEvent event, String message);
  public void onShutdown();
}
```

The framework handles all the nasty bits such as connection, re-connection delivery etc.

## Trac board implementation

### OnStartup
```java
public boolean onStartup(Logger logger, ConnectionFactory connectionFactory) {
  connectionFactory.setHost(NATS_HOST);
  connectionFactory.setPort(NATS_PORT);
  return true;
}
```

The method conveniently provides a NATS connection factory. All we need to do is set the default NATS port and server host IP address.

### OnNatsInitialized
```java
public boolean onNatsInitialized(NATSConnector natsConnector) {
  try {
    connector = natsConnector; //We'll be passing the connector around
    startDetectionThread();
    connector.subscribe("tracCode.command");
  } catch (Exception e) {
    return false;
  }
  return true;
}
```

On initializing the connector we subscribe to a command queue which will accept custom commands such as resends . We also start a detection thread that will begin capturing images and processing them.

### onNATSMessage
```java
public void onNATSMessage(Message message) {
  String messageData = new String(message.getData());
  if (messageData.toLowerCase().equals("resend:board")) {
    try {
      processor.resendBoard();
    } catch (Exception e) {
      logger.debug("Error sending message: " + e.getMessage());
    }
  } else if (messageData.toLowerCase().equals("reset:board")) {
    try {
      processor.resetBoard();
    } catch (Exception e) {
      logger.debug("Error clearing board");
    }
  } else if (messageData.toLowerCase().equals("snap:board")) {
    try {
      processor.snapImage();
    } catch (Exception e) {
      logger.error("Error snapping board");
    }
  } else if (messageData.toLowerCase().equals("send:lanes")) {
    try {
      Message lanesMessage = new Message();
      TracLaneMessage laneMessage = new TracLaneMessage("MAIN",TracProcessor.TEAM_NAME, new Date(), getTracLanes());
      processor.publishMessage(laneMessage, "tracCode.qr.lanes");
    } catch (Exception e) {
      logger.error("Error snapping board");
    }
  }
  logger.debug("Connector received a message");
}
```

The **OnNATSMessage** method is invoked on reception of a message received via a subscribed to queue.  

---

And that’s all folks!

The processing, synchronization, Messaging (NATS.io), action processing and deployment will be self contained services (micro services) hosted in AWS using docker containers which will allow any Agile team to subscribe to the framework. All that teams need to join the party is set up a pi cam on a raspberry Pi Zero (or similar device), install a simple java application and configure some account details and Boom! you’re in.

The Trac board project was our introduction into using NATS.io but certainly will not be our last, its simplicity makes its quick and easy to integrate into existing frameworks.

<img class="img-responsive center-block" alt="Alchemy and NATS" src="/img/blog/alchemys-twist-on-the-agile-scrum-board-using-nats/01.jpg">

<img class="img-responsive center-block" alt="Alchemy and NATS" src="/img/blog/alchemys-twist-on-the-agile-scrum-board-using-nats/04.jpg">

## Additional Resources

<div class="row">
  <div class="col-md-12">
    <div class="center-block">
      <div class="embed-responsive embed-responsive-16by9">
        <iframe width="560" height="315" src="https://www.youtube.com/embed/GRmaij2Wzyc" frameborder="0" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</div>
