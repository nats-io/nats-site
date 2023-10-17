+++
date = "2023-10-13"
draft = true
title = "Streamlining Asynchronous Services with FastStream"
author = "Tvrtko Sternak"
categories = ["Engineering"]
tags = ["NATS", "FastStream", "Python", "microservices"]
+++

Ever felt lost in the complexity of microservices and message queues? That's precisely why FastStream was created. Initially, it was our solution to the challenges we faced with messaging queues in our own projects. But as it simplified our lives, we realized it could do the same for others. So, we decided to share it with the world.

FastStream is a Python framework for building asynchronous services that interact with event streams like Apache Kafka, RabbitMQ, and NATS. It streamlines the entire process of working with message queues in microservices. Parsing messages, managing networking, and keeping documentation updated—all handled effortlessly.

We are happy to announce that FastStream supports NATS by building on top of the [official nats-io python client](https://github.com/nats-io/nats.py)!

## Features

Designed with junior developers in mind, **FastStream** simplifies your work while keeping the door open for more advanced use-cases. Here's a look at the core features that make **FastStream** a go-to framework for modern, data-centric microservices.

- **Multiple Brokers**: **FastStream** provides a unified API to work across multiple message brokers (**NATS**, **Kafka**, **RabbitMQ** support)

- [**Pydantic Validation**](#writing-app-code): Leverage [**Pydantic's**](https://docs.pydantic.dev/) validation capabilities to serialize and validates incoming messages

- [**Automatic Docs**](#project-documentation): Stay ahead with automatic [**AsyncAPI**](https://www.asyncapi.com/) documentation

- **Intuitive**: Full-typed editor support makes your development experience smooth, catching errors before they reach runtime

- [**Powerful Dependency Injection System**](#dependencies): Manage your service dependencies efficiently with **FastStream**'s built-in DI system

- [**Testable**](#testing-the-service): Supports in-memory tests, making your CI/CD pipeline faster and more reliable

- **Extendable**: Use extensions for lifespans, custom serialization and middlewares

- [**Integrations**](#any-framework): **FastStream** is fully compatible with any HTTP framework you want ([**FastAPI**](#fastapi-plugin) especially)

- [**Built for Automatic Code Generation**](#code-generator): **FastStream** is optimized for automatic code generation using advanced models like GPT and Llama

## Let's build something!

Let's get our hands a bit dirty.
We'll implement an example python app using **FastStream** that consumes names from "persons" subject and outputs greetings to the "greetings" subject.

### Cookiecutter project

To start our project, we will use the prepared cookiecutter FastStream project. To find out more about it, check our [detailed guide](https://faststream.airt.ai/latest/getting-started/template/).

Install the [cookiecutter](https://github.com/cookiecutter/cookiecutter) package using the following command:
```sh
pip install cookiecutter
```
Now, run the provided cookiecutter command and fill out the relevant details to generate a new FastStream project, we will name this project "greetings_app":
```
cookiecutter https://github.com/airtai/cookiecutter-faststream.git
```

The cookiecutter creation process should look like this:

```shell
You`ve downloaded /Users/tvrtko/.cookiecutters/cookiecutter-faststream before. Is it okay to delete and re-download it? [y/n] (y): y
  [1/4] username (github-username): sternakt
  [2/4] project_name (My FastStream App): Greetings App
  [3/4] project_slug (greetings_app): greetings_app
  [4/4] Select streaming_service
    1 - kafka
    2 - nats
    3 - rabbit
    Choose from [1/2/3] (1): 2
```

Change the working directory to the newly created directory and install all development requirements using pip:
```sh
cd greetings_app
pip install -e ".[dev]"
```

Now we are ready to edit our greetings_app/application.py and tests/test_application.py files to implement our application logic. 


### Writing app code

**FastStream** brokers provide convenient function decorators `@broker.subscriber` and `@broker.publisher` to allow you to delegate the actual process of:

- consuming and producing data to Event queues, and

- decoding and encoding JSON encoded messages

These decorators make it easy to specify the processing logic for your consumers and producers, allowing you to focus on the core business logic of your application without worrying about the underlying integration.

Also, **FastStream** uses [**Pydantic**](https://docs.pydantic.dev/) to parse input JSON-encoded data into Python objects, making it easy to work with structured data in your applications, so you can serialize your input messages just using type annotations.

Here is an example python app we talked about:

```python
from faststream import FastStream, Logger
from faststream.nats import NatsBroker
from pydantic import BaseModel, Field

version = "0.1.0"
title = "My FastStream service"
description = "Description of my FastStream service"


class Name(BaseModel):
    name: str = Field(..., description="Name of the person")


class Greeting(BaseModel):
    greeting: str = Field(..., description="Greeting message")


broker = NatsBroker()
app = FastStream(broker, title=title, version=version, description=description)

to_greetings = broker.publisher(
    "greetings",
    description="Produces a message on greetings after receiving a meesage on names",
)


@broker.subscriber("names", description="Consumes messages from names subject and produces messages to greetings subject")
async def on_names(msg: Name, logger: Logger) -> None:
    result = f"hello {msg.name}"
    logger.info(result)
    greeting = Greeting(greeting=result)
    await to_greetings.publish(greeting)
```

The example application will subscribe to **persons** Nats subject and consume Name JSON messages from it. When the application consumes a message it will publish a Greetings JSON message **greetings** subject.

We can save the application into the `application.py` file and let's take a closer look at the code.

**Creating a broker**
To create an application, first we need to create a broker. This is the main piece of FastStream and takes care of the defining subscribers and producers.

```python

version = "0.1.0"
title = "My FastStream service"
description = "Description of my FastStream service"

...

broker = NatsBroker()
app = FastStream(broker, title=title, version=version, description=description)
```

**Defining data structures**
Next, we need to define the structure of incoming and outgoing data. FastStream is integrated with Pydantic and offers automatic encoding and decoding of JSON formatted messages into Pydantic classes.

```python
class Name(BaseModel):
    name: str = Field(..., description="Name of the person")


class Greeting(BaseModel):
    greeting: str = Field(..., description="Greeting message")
```

**Defining a publisher**
Now, we define the publishing logic of our application.

```python
to_greetings = broker.publisher(
    "greetings",
    description="Produces a message on greetings after receiving a message on names",
)
```

**Defining a subscriber**
Finally, we can define the subscribing logic of our application. The app will consume data from the "names" subject and use the defined publisher to produce to the "greetings" subject whenever a message is consumed.

```python
@broker.subscriber("names", description="Consumes messages from names subject and produces messages to greetings subject")
async def on_names(msg: Name, logger: Logger) -> None:
    result = f"hello {msg.name}"
    logger.info(result)
    greeting = Greeting(greeting=result)
    await to_greetings.publish(greeting)
```

### Testing the service

The service can be tested using the `TestBroker` context managers, which, by default, puts the Broker into "testing mode".

The Tester will redirect your `subscriber` and `publisher` decorated functions to the InMemory brokers, allowing you to quickly test your app without the need for a running broker and all its dependencies.

Using pytest, the test for our service would look like this:

```python
import pytest
from faststream.nats import TestNatsBroker

from greetings_app.application import Greeting, Name, broker, on_names


# Subscribe to the "greetings" subject so we can monitor 
# messages our application is producing
@broker.subscriber("greetings")
async def on_greetings(msg: Greeting) -> None:
    pass


@pytest.mark.asyncio
async def test_on_names():
    async with TestNatsBroker(broker):
        # Send John to "names" subject
        await broker.publish(Name(name="John"), "names")
        
        # Assert that our application has consumed "John"
        on_names.mock.assert_called_with(dict(Name(name="John")))

        # Assert that our application has greeted John in the "greetings" subject
        on_greetings.mock.assert_called_with(dict(Greeting(greeting="hello John")))
```

In the test, we send a test User JSON to the **in** subject, and then we assert that the broker has responded to the **out** subject with the appropriate message.

We can save the test to the test_application.py file and run the test by executing the following command in our application root file.

```shell
pytest
```

Here is how the tests execution should look like in your terminal:

```shell
===================================== test session starts =====================================
platform darwin -- Python 3.11.5, pytest-7.4.2, pluggy-1.3.0
rootdir: /Users/tvrtko/Documents/Airt Projects/FastStream/faststream-cookiecutter/greetings_app
configfile: pyproject.toml
plugins: asyncio-0.21.1, anyio-3.7.1
asyncio: mode=Mode.STRICT
collected 1 item                                                                              

tests/test_application.py .                                                             [100%]

====================================== 1 passed in 0.34s ======================================
```

### Running the application

The application can be started using built-in **FastStream** CLI command.

To run the service, use the **FastStream CLI** command and pass the module (in this case, the file where the app implementation is located) and the app symbol to the command.

``` shell
faststream run greetings_app.application:app
```

After running the command, you should see the following output:

``` shell
2023-10-13 08:36:32,162 INFO     - FastStream app starting...
2023-10-13 08:36:32,170 INFO     - names |            - `OnNames` waiting for messages
2023-10-13 08:36:32,177 INFO     - FastStream app started successfully! To exit, press CTRL+C
```

Also, **FastStream** provides you a great hot reload feature to improve your Development Experience

``` shell
faststream run greetings_app.application:app --reload
```

And multiprocessing horizontal scaling feature as well:

``` shell
faststream run greetings_app.application:app --workers 3
```

### Documentation

FastStream provides a command to serve the AsyncAPI documentation, let's use it to document our application.
To generate and serve the documentation, run the following command:

```shell
faststream docs serve greetings_app.application:app
```

Now, you should see the following output:

```shell
INFO:     Started server process [47151]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://localhost:8000 (Press CTRL+C to quit)
```

Now open your browser at `http://localhost:8000` and enjoy in your automatically generated documentation!

<img class="img-responsive center-block" alt="FastStream NATS app documentation" src="/img/blog/nats-supported-by-faststream/docs_example.png">

Aaaand, that's it! Feel free to experiment further with your application and checkout [the documentation](https://faststream.airt.ai/latest/) for more complex examples.

## Support us on GitHub and join our community

Head over to our [GitHub repository](https://github.com/airtai/faststream) and show your support by starring it. By doing so, you'll stay in the loop with the latest developments, updates, and enhancements as we continue to refine and expand FastStream.

## Conclusion

FastStream is your go-to tool for efficient microservices development. It simplifies message queues, and offers Pydantic validation and auto-doc generation.

We're immensely grateful for your interest, and we look forward to your potential contributions. With FastStream in your toolkit, you're prepared to conquer the challenges of data-centric microservices like never before. Happy coding!

## About the Author

Tvrtko Sternak is a developer at [AIRT](https://airt.ai/) and one of the creators of [FastStream](https://faststream.airt.ai/latest/).

