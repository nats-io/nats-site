+++
categories = ["Engineering", "Community"]
date = "2016-04-15T10:22:41-08:00"
tags = ["nats", "IoT", "nodejs", "Samsung", "makers", "ARTIK", "hackathon"]
title = "Guest Post: NATS and IoT helping to meet Civic needs: An Example Project: Ripple"
author = "Jason Rotella"
+++

In the context of a submittal to the Samsung Maker’s Against Drought Challenge (more on that [here](http://artik.devpost.com/)) extended hackathon, my team has developed a partial solution to the very serious California drought crisis. I say partial since this problem is so vast that many solutions are required to operate collaboratively to fully solve it.

The solution utilizes physical water system monitoring and control with Samsung ARTIK 10 IoT modules, and a [Particle Photon](https://store.particle.io/) module running the [arduino-nats](https://github.com/isobit/arduino-nats)  NATS client. One ARTIK 10 is running a custom server written in Go and the second is running a NATS server and local database.

[Ripple](http://devpost.com/software/ripples) incorporates concepts of pairing of users, via mobile applications, with: water devices they wish to use, as well as other people with similar conservation goals, and/or interest in receiving similar rewards for conserving water. Conserving water can span from simply reducing usage to, for example, using water supplied by reclamation or desalinization systems.

The Ripple concept also incorporates a “civic override” feature, which enables organizations such as homes and businesses to authorize that consumption of water be preempted based on particular acute needs for the limited supply of water in an extended community. For example, operation of appliances such as dishwashers or washing machines could be preempted. By utilizing the civic override feature, community-wide good-will can be extended by, for example: providing drinking water to firefighters fighting a wild-fire (possibly caused by the drought conditions), or provision of a certain amount of water to irrigate a portion of little league infield. These good-will gestures add up in a way similar to how small donations can result in construction of entire buildings, one donor-brick at a time; with Ripple, it is one cup at a time. Diverse civic overrides can be established to produce end-results that are important to distributed members of a particular community of intent.

The result is community-driven water conservation based on collective goals, an example of ‘Social IoT’.
From the above summary description, we hope it is clear that the implementation of such a potentially widespread and impactful concept as Ripple is a perfect job for NATS. In the current implementation, NATS is utilized at the core of the concept of Ripple, as a way to funnel water flow measurements from [Particle Photon](https://store.particle.io/) modules to a Go server. This Go server runs multiple goroutine-based concurrent software finite state machines, and is responsible for interfacing with physical water system monitoring and control components, as well as providing emulation capabilities and functionality to implement the social and civic aspects covered above. The water flow measurements are paired with the server logic via subjects that each server finite state machine is subscribed to to enable proper processing. Given the richness of applications for NATS, during the finalist build period, we are considering the best mix of additional uses for NATS in the overall architecture. The fast, simple, and lightweight nature of NATS as open source IoT messaging system make it well suited for a wide variety of applications.

Below are photos of the physical portion of the system and short sample videos of it in operation. These photos and videos demonstrate the monitoring and control aspects of the concept, which are the underpinnings of the social and civic aspects.
Here is a photo of the overall physical piping system model, which would be augmented with emulated devices to constitute the variety of water devices typically available to users.

<img class="img-responsive center-block" src="/img/blog/RipplePicture.jpeg">

On the top right is the water supply inlet. There are four water consumption endpoints connected to this inlet. Each of these endpoints has a solenoid-operated valve and flow-meter in-line. Each flow meter will measure water consumption and report the consumption to the server via NATS resulting in the application of the consumption toward a quota. Depending on water used relative to quotas, and participation in other means of social water conservation, personalized rewards are provided to water users.
The first connection to the left of the inlet provides water to the water reclamation tank, which is the black basin on the right below the piping system. This connection is used to fill the reclamation tank in the event that insufficient water has been reclaimed (i.e., rainwater or graywater) to supply the need of devices (e.g., toilet tank refill) that are fed from reclaimed water.
The next three connections to the left of the reclamation tank feed line can represent any combination of water consumption devices in a home or business, including showers, sinks, sprinkler systems, clothes washers, dishwashers, etc. Each of these three example water consumption points is fed from the water supply inlet (i.e., not from reclaimed water).

Here is a video of a water consumption device providing graywater to the reclamation tank (which will result in no quota consumption for using this device given the overall policy as currently specified). This device is then switched to simply drain in the normal manner (i.e., by switching basins), in which case consumption relative to a quota would be calculated. This encourages the installation of water reclamation systems in a home or business. During the consumption of water, the exact user and device are known. Furthermore, all users will have collectively established their quotas based on balancing sensitivity to civic need with personal preferences.

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/f8c6g1DOMcY" frameborder="0" allowfullscreen></iframe>
</div>

Here, we see a short example depiction of a toilet tank being refilled with the water that has been reclaimed. Another use of the reclaimed water could be for watering of personal gardens:

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/7X4SGwogauA" frameborder="0" allowfullscreen></iframe>
</div>

Ripple has obtained great support to this point. We hope to advance the NATS ecosystem with the eco-friendly use case Ripple represents.
Please consider Voting for and Liking this social/civic IoT project. Votes for Ripple will help us advance this NATS use case to the finalist round, and are greatly appreciated!

Votes are accepted at http://devpost.com/software/ripples through 4/23/2016. When voting, please Like also, since this allows us to track support.

More updates will be released either on this blog or at the DevPost link above as the design progresses.
