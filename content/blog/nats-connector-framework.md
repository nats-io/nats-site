+++
categories = ["Engineering", "Community"]
date = "2016-04-29"
tags = ["NATS", "Connector", "java", "Tutorial"]
title = "Using the NATS Connector Framework"
author = "Colin Sullivan"
+++

NATS is outstanding at moving data between endpoints - but what kinds of endpoints? You may have legacy applications that use some proprietary data sources, or perhaps you are migrating from another messaging technology onto NATS. For cases like these, you'll want to take advantage of the [NATS Connector Framework](https://github.com/nats-io/nats-connector-framework).

## The NATS Connector Framework

The NATS Connector Framework provides a foundation to build a **connector** - an application that moves data into and out of NATS. In creating the connector framework, NATS tenets of simplicity, usability, and community were kept in mind. This resulted in a simple, extensible, and single purposed framework for users to quickly and easily build reusable bridges between NATS and other technologies.


### Usability

The NATS Connector framework is written in Java - Java is popular, known by developers, and most technologies - especially legacy - provide a Java API. This will allow the connector framework to be used in bridging a multitude of different technologies.

For extensibility, the connector framework was designed with a plug-in architecture. Developers code a class to a simple, straightforward java interface, then a connector instance is started referencing their class. That's it - the framework does the rest - logging, startup and shutdown, event management, and basic setup and usage of NATS. While NATS is already simple and easy to use, this allows valuable time to be focused on domain expertise rather than writing general application code for a bridge.


### Community
With the plugin architecture of the ready-to-use framework, creating connectors is straightforward. We on the NATS team would love to see community users develop and share connectors. We'll gladly link to user contributions, and include these in the growing list of community developed NATS projects [here](https://nats.io/community).

As the NATS Connector framework is open source, don't forget that **you have a say**.  Contact the NATS team with ideas, suggestions, or comments, and feel free to go ahead and submit pull requests.  Let us know of the connectors you build!  To coin a phrase, *"All of us are smarter than any of us"*.

# Tutorial
For this tutorial, I'll be using [IntelliJ IDEA](https://www.jetbrains.com/idea) as an IDE to setup the project and generate code.  In the interest of brevity, I'll build a simple "file" connector - writing incoming NATS messages to a file, and when a particular file is present, publishing a NATS message with the file contents.

The tutorial includes...

### Project Creation
We'll create a project from scratch using the OSS coordinates to download the NATS Connector Framework.  Note, there are other options such as downloading the github repository and building the framework yourself using maven.

### Implementation of Connector Interfaces
The tutorial demonstrates implementing connector interfaces to build a plug-in.  The interface documentation can be found [here](https://nats-io.github.io/nats-connector-framework/io/nats/connector/plugin/NATSConnectorPlugin.html).

I'll implement the interfaces required for a NATS connector framework, and provide required code to create a stand-alone application utilizing the framework.

### Running a Connector
This will show the new connector in action, generating and publishing NATS messages from file contents and creating files from incoming NATS messages.

It takes just minutes to create a connector so the tutorial is short:

<div class="embed-responsive embed-responsive-16by9">
  <iframe width="560" height="315" src="https://www.youtube.com/embed/VTKODUoC12A" frameborder="0" allowfullscreen></iframe>
</div>

# What's Next?
The future is wide open, and we're planning on creating a number of connectors including RabbitMQ and Apache Kafka to name a few - if there is one you'd like to see or contribute, don't hesitate contact us or open an issue.  Visit our [Community](https://nats.io/community/) Page!

If you'd like to look at a full featured connector, check out the [NATS Redis Publish/Subscribe Connector](https://github.com/nats-io/nats-connector-redis).

### Tutorial Code
Below is the entirety of java code created for this tutorial:

```java
import io.nats.client.ConnectionFactory;
import io.nats.client.Message;
import io.nats.connector.Connector;
import io.nats.connector.plugin.NATSConnector;
import io.nats.connector.plugin.NATSConnectorPlugin;
import io.nats.connector.plugin.NATSEvent;
import org.slf4j.Logger;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.concurrent.Executors;

public class FileConnector implements NATSConnectorPlugin
{
    Logger logger = null;
    NATSConnector connector = null;
    FileDataStore fileDataStore = null;

    /**
     * Simulate a data source/sink, by reading and writing
     * files to /tmp
     */
    public class FileDataStore implements Runnable
    {

        static final String SOURCE_FILE = "/tmp/demo_import";
        static final String DEST_FILE   = "/tmp/demo_export";

        // use a volatile for brevity here in non critical code.
        volatile boolean finished = false;

        int fileCount = 0;

        public FileDataStore() {
            Executors.newSingleThreadExecutor().execute(this);
        }

        public void run() {
            Message m = new Message();
            m.setSubject("file.import");
            Path p = Paths.get(SOURCE_FILE);

            while (!finished) {
                try {

                    Thread.sleep(1000);
                    m.setData(new String(Files.readAllBytes(p)).getBytes());
                    connector.publish(m);

                    // delete the file we just sent
                    Files.delete(p);

                } catch (java.io.IOException ioe) {
                    logger.debug("Unable to read send file.");
                } catch (Exception e) {
                    ;;
                }
            }
        }

        public void finish() {
            finished = true;
        }

        public void write(byte[] data) {

            // write data to a new file.
            String fileName = DEST_FILE + "_" + fileCount++;

            try {
                File f = new File(fileName);
                BufferedWriter bw = new BufferedWriter(new FileWriter(f));
                bw.write(new String(data));
                bw.close();
            }
            catch (Exception e) {
                logger.error(e.getMessage());
            }
        }
    }

    public boolean onStartup(Logger logger, ConnectionFactory connectionFactory) {
        this.logger = logger;
        return true;
    }

    public boolean onNatsInitialized(NATSConnector natsConnector) {
        try {
            connector = natsConnector;

            // start our
            fileDataStore = new FileDataStore();

            connector.subscribe("file.export");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public void onNATSMessage(Message message) {
        fileDataStore.write(message.getData());
    }

    public void onNATSEvent(NATSEvent natsEvent, String s) {
        logger.info(s);
    }

    public void onShutdown() {
        if (fileDataStore != null)
            fileDataStore.finish();
    }

    public static void main(String[] args)
    {
        System.setProperty(Connector.PLUGIN_CLASS, FileConnector.class.getName());

        try {
            new Connector(null).run();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

}
```
