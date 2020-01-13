+++
categories = ["Engineering", "Community"]
date = "2016-01-06T10:59:20-08:00"
tags = ["microservices", "nats", "nextgenleads"]
title = "NextGen Leads Auctions: Powered by NATS"
author = "Aaron John Schlosser"
+++

[NextGen Leads](https://www.nextgenleads.com) aims to provide extremely high quality [health insurance leads](https://www.nextgenleads.com/health-insurance-leads) and [Medicare supplement leads](https://www.nextgenleads.com/medicare-leads) by streamlining the lead buying experience from end to end. Our leads are generated internally by a team of lead generation experts; they are not brokered by any third party. They are then delivered in real time and never oversold, passing through various filters to ensure that our customers can place bids on only those leads that they want. In fact, our unique second price auction model ensures that our customers always pay the minimum amount necessary to win a lead.

In lead generation, timing is of the essence. Mere seconds can make the difference between a hot and cold lead. As such, we chose NATS as the messaging service that would serve as the "glue" for our microservices architecture. Each of our workers, spread across a scalable number of servers, communicates with one another via our NATS infrastructure. In this manner, as we continue to grow and scale upwards, we can remain confident that our app can handle an exponentially increasing number of transactions.

Thanks to NATS, we can be certain that a lead generated in our funnel can be normalized, sent to auction, purchased, and shipped practically instantaneously. This provides our customers with a truly real time lead buying experience. We send raw lead data, as it is generated, to a normalizer that preps it for auction; then, based on the origin of the data and its unique characteristics, it is routed to one of our many different auction processes; there, our customers place bids on it; finally, the lead is routed to one of many different shipment handlers that deliver it to those customers with winning bids according to their unique delivery needs. These can range from automated CRM shippers (e.g., an XML or JSON POST to a customer's API endpoint) all the way to human agents who connect our customers to our leads via live transfers over the telephone. At every step of the process, NATS is there to route our data to where it needs to be:

<img src="/img/blog/nextgenleads-nats-arch.png" alt="NextGen Leads' NATS-powered microservices architecture diagram">

Another feature of NATS is its great simplicity. Our largely JavaScript-based stack (AngularJS on the front-end and Node.js on the back-end with RethinkDB) works seamlessly with NATS thanks to the [Node.js client](https://github.com/nats-io/node-nats). The [NATS server](https://github.com/nats-io/gnatsd) works out-of-the-box and is deployed with ease, and the API is elegant and straightforward. Training new full-stack engineers to work with NATS requires a very minimal up-front investment, which is a huge advantage for any ambitious startup.

In the end, we at NextGen Leads are glad to have chosen NATS and are looking forward to continuing to grow thanks to NATS' scalability and ease of use! Feel free to [tweet](https://twitter.com/ajschlosser) at me if you're thinking about using NATS for your own project, or follow us at [NextGenLeads](https://twitter.com/NextGenLeads) to see how we continue to use NATS to scale upwards as we take on new verticals.