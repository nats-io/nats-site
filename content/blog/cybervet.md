+++
categories = ["Community", "Engineering"]
date = "2023-06-26"
tags = ["nats", "microservices", "technical", "telehealth", "synadia"]
title = "Building a Data-Driven Healthcare Demo with NATS.io"
author = "David Gee"
+++

We're lucky to have partners and customers in healthcare and even luckier to have a team of highly skilled and talented software engineers. So when the challenge came along to build a meaningful demo for a Telehealth scenario, we couldn't resist. No conversation on this topic would be complete without a sprinkle of AI or ML and so we posit that when used for good, these technologies can be applied to the preservation and quality of human life. That said, there are many challenges which range from measuring and digitizing signals from humans, to processing that data into meaningful actions and managing services at a high level for patient care.

NATS is perfectly positioned as a data substrate, making it easy to acquire data and interact with systems from the nearest, farthest and tiniest of edges, transporting data to the processing systems, and storing the data in key-value stores, data streams and object-stores. In fact, if you didn't know that NATS has been around for over a decade, you might guess that it was made for the job.

### Data-Driven Healthcare
Many people already walk our streets with pacemakers that have connected sensors and in a hospital ward, patients are attached to life sustaining machinery and sensors in closed feedback loops. In the case of a pacemaker, patients receive notifications on their phones when something is wrong or when a change has been made. With high frequency data from patients and great analysis, medical professionals can tune treatment and medication, they can decide on better courses of health management and the societal benefits of healthy humans needs no explanation.

<img src="/img/blog/cybervet_post_hospital_bed.png" height="400px" width="400px">


Where NATS is concerned, messages are transported in payloads that have a name, called a subject and these subjects can be tokenised, which can be very helpful. Let’s go through an example. At a basic level, a patient is onboarded into a biodata system and sensors are attached. The patient has an identifier like an internal ID and each sensor has its own ID like so: `patientId.sensorId.` If we were thinking about this in the scope of a global system, we could add further tokens to this subject name like this: `uk.royalcollege.patientId.sensorId.`

With NATS and a tokenized naming approach, it’s possible to subscribe at the country level (don't do that unless you're ready for the firehose!), the area, to the patient or to the individual sensor. Systems that show interest for the subject can then process the data in real time, or the data can be put into a stream that enables temporal decoupling patterns and non-real-time processing. Data can be processed in stages and stored in a key-value bucket, or even as an object, which is where the final processed payload could reside. Not every patient has the same care requirements or response times and so, if we have a global system with a well-thought-out tenant scheme and subject naming scheme, we can set priorities on a patient’s data compute and sovereignty requirements and thus, some patients data can be processed in real-time, with others processed non-real-time or in quiet times when compute costs are lower.

This is a fascinating topic and this article barely scratches the surface. If you want to explore more, feel free to [get in touch](mailto:info@synadia.com)! We would love to hear from you.

### Making Ideas Memorable
[Synadia](https://www.synadia.com?utm_source=nats_io&utm_medium=nats) is all about big bang demos and injecting thoughts beyond Powerpoint presentations. We decided to do something about Telehealth just after KubeCon EU in April 2023 and since then, we committed to a one of a kind demo in the form of an arcade game, Cybervet, entirely powered by NATS for Susecon in Munich which spanned the 20th - 22nd of June 2023. The game has patients and surgeons, in which surgeons try to save the patients, but with a twist. As a patient, you can inflict infections and damage against your game patient character, with the worst move being to present the patient with the medical bill. Check out the video below for a tour of Cybervet, or you can go play at[http://cybervet.io](http://cybervet.io).

<iframe width="560" height="315" src="https://www.youtube.com/embed/uiNeRjj9ukM" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

<br />Every action is controlled by the game server and every action results in state changes either in the user or match key-value store, in a data stream or in the transmission of telemetry for operations. NATS extends data and command and control capabilities from the data center right out to the tiniest of edge locations and in our data-driven world, you only need one platform for ephemeral and persistent publish-subscribe, request-response, key-value, data streaming and object storage. We had an absolute blast sharing the game at our booth at Susecon23 and special thanks goes to [Delaney Gillian](https://www.linkedin.com/in/delaney-gillilan-338734a8/), a fellow Synadian who not only accepted the challenge of creating the game, but made Cybervet a reality.

Questions? Join our [Slack channel](https://slack.nats.io) or email [info@synadia.com](mailto:info@synadia.com)

### About the Author
[David Gee](https://www.linkedin.com/in/davedotdev/) is a systems engineer at Synadia Communications with twenty years of experience in constrained systems, industrial process control, network control software & automation and more. He specialises in IoT, IIoT and edge systems.



