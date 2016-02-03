+++
categories = ["Community", "Engineering"]
date = "2016-02-02T11:22:41-08:00"
tags = ["nats", "microservices", "technical", "guest post", "financial services"]
title = "Guest Post - How Aditiva uses NATS in the Financial Services industry"
author = "Andrés Cerda Jullian"
+++
[Aditiva] (http://www.aditiva.com/) recently started to use NATS inside solutions for financial institutions that are our customers. In this blog entry, you can learn more about Aditiva, some of our products, and how we use NATS in delivering these solutions for financial institutions.
<br>

Aditiva provides a High Performance Financial Transactional Platform (Aditiva EFT),that integrates Financial Institutions’ Core Systems, with 3rd party networks. For example, Financial Institution Customers execute different Financial Transactions using Plastic Cards from ATMs and POS networks; these generate ISO 8583 transaction messages, that are captured and routed to authorization services provided by the Aditiva EFT Platform installed on Financial Institution premises or on the Issuer side, and it is managed and supported by Aditiva.
<br>

Card holders for financial institutions can also drive the processing of financial transactions on their accounts, using the Plastic Cards at Teller instances on Financial Institution Nationwide branches networks using Aditiva EFT Teller application.
<br>

Customers Account Managers use the Aditiva EFT Card Management Intranet Platform, to manage the inventory of plastic cards distributed to branches assign plastic cards to customers and activate the plastic card with chips, allowing customers operate on Financial Networks.
<br>

Financial institutions can also provide Web Banking Services to their Customers using Aditiva EFT Web Banking Platform - improving service levels for their end customers.
<br>
<br>
### **How we use NATS**
Aditiva chose NATS as the transport layer for the different types of transaction publishers that originate transactional data messages and transaction subscribers that authorize them on top of the financial institutions’ Core Systems.

Thanks to NATS we have being able to easily process more than 500K transaction messages/sec at the Brokerage level, which has allowed us to incorporate a Centralized Transaction Engine that integrates different applications and technology to process data transaction messages, between front-end and back-end Systems including: Java, NodeJS, C, C#, Golang, Database Transactions, Store Procedures and Financial Terminal peripherals like Pin Pads, POS, Bar Coder, Check readers typically used in Retail Banking.
<br>

The Aditiva EFT solution with NATS operates according to EMV standards, PCI-DSS and is compliance with highest levels of security required by Operational Risks controls required by the Financial Institutions, and Financial Institution´s and Insurance Superintendence.
<br>
<img class="img-responsive center-block" src="/img/blog/Aditivasolution.png" alt="Aditiva Solution architecture diagram using NATS">

<br>
<br>
### **About Aditiva**

Aditiva is a Financial Software Developer and Consultancy and IT Service Provider Private Company. Aditiva solutions are being used in Trade Finance, Retail Banking, Commercial Banking and Micro Finance. Aditiva IT engineering teams have more than 20 years of experience developing and maintaining first class Financial Institutions in Latin America.
