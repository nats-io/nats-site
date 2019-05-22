# event-enabling-the-internet-of-things-using-aws-lambda-nats-and-apcera

+++ categories = \["Engineering"\] date = "2016-02-10T11:22:41-08:00" tags = \["nats", "AWS", "lambda", "IoT"\] title = "Event Enabling the Internet of Things using AWS Lambda, NATS and Apcera" author = "Dean Sheehan" +++

Recently I decided to see how easy it would be to create an \[AWS Lambda\] \([https://aws.amazon.com/lambda/](https://aws.amazon.com/lambda/)\) equivalent within the \[Apcera\] \([https://www.apcera.com/](https://www.apcera.com/)\) trusted cloud platform and use \[NATS\] \([https://www.nats.io](https://www.nats.io)\) as an event source for triggering function invocations. This blog entry gives an outline of AWS Lambda, the approach I took to get a first implementation up and running and offers up some thoughts on possible futures.

## What is AWS Lambda?

AWS Lambda \(λ\) is computation without computers, or at least without the explicit notion of computer machines, virtual or physical hosts; in many ways, the ultimate evolution of Platform As A Service and Microservice architectures.

In λ, you implement your behavior as a function in one of three currently supported languages, Node.js, Java or Python with the bare minimum of fuss. In Node.js, for example, you populate the body of a function that looks something like:

```text
exports.myHandler = function(event, context) {
      // your code goes here
    context.success('hello')
}
```

where the input _event_ object provides access to any data passed to the function and the context object provides meta information about the execution and callback handlers so that your function can report successful completion with response data or possibly failure.

That’s it. Write your function and deploy it to λ for execution when and wherever it is needed without worrying about how.

So when, or rather why, is your λ function executed? Well, you can configure λ so that your function is exposed through an HTTP API Gateway causing your function to be evaluated in response to a URL access.

`$ curl https://myawsdomain.com/myfunction`

Everytime you hit that URL, λ::

* instantiates the compute resources required to execute your function
* marshalls the input data, executes your function
* marshalls any response data and then tears down the compute resources that were being used

This all happens very quickly.

In addition to ‘on demand’ execution via the API Gateway, λ provides very simple mechanisms to associate your functions with a variety of event sources within the AWS service ecosystem. For example, you can associate your functions with Create, Update or Delete operations on S3 buckets, Insert, Update or Delete of rows in DynamoDB tables, receipt of records in Kinesis streams etc.

All very simple, and you are only charged for the compute resources consumed for the actual function execution, not a complete EC2 instance sitting there most of its time idle waiting for something to do.

## Apcera and NATS

The Apcera trusted cloud platform provides all of the machinery necessary to support λ functions in a multi-cloud, multi-language and a well governed manner. NATS provides a simple, fast and highly scalable message transport - a marriage made in heaven. Here’s how I went about introducing the two and creating a λ framework.

The first step was to enable an AWS Lambda function to be deployable to Apcera ‘as is’. This was simply a matter of taking the scaffolding required for a typical Node.js web application \(think Node.js / Express\), separating that out from the λ function and creating a package artifact for that scaffolding so that it could be reused, by way of package dependencies, time and time again for different function implementations. Pretty much boiled down to ‘tar’ up the scaffolding directory and then uploading to Apcera as a package.

`$ apc package from file scaffolding.tar --provides package.scaffolding`

This meant that a λ function was then deployable ‘as is’ by virtue of adding a manifest file that included a dependency on the scaffolding package.

```text
package_dependecies: [
    ‘package.scaffolding’
}
```

allowing you to the deploy the function with

`$ apc app create myfunction`

The next step was to create a Dispatcher that would expose a URL through the Apcera HTTP\(S\) Routers and using the Apcera API to spin up Job instances on demand based on the deployed function packages in response to requests against the URL. As well as spinning jobs up on demand, I extended the Dispatcher to manage a simple pool of standby jobs to ensure near immediate availability of an execution environment for a function.

Some new commands allowed me to manage the mapping of function packages through to function names against the Dispatcher URL.

`$ apc-fn bind -p package::/sandbox.dean/myfunction -f myfunction`

We now have a functioning λ framework within Apcera with an HTTP API Gateway

`$ curl http://lambda.apcera.demo.net/myfunction hello`

The diagram below outlines the flow between the main components in the system:

![](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/NATS_Lambda_Image_1.png)

1. An HTTP\(S\) request is received by the Apcera Routers
2. The Apcera Router redirects the request to the Dispatcher that is running somewhere within the cluster.
3. The Dispatcher looks at the URL being accessed and the mappings it has of URL fragments to function packages held in the Apcera Package Repository.
4. If the Dispatcher has a mapping registered it uses the Apcera API to instantiate a Job based on the function package
5. The Dispatcher invokes the function within the newly created Function Job instance

   \(Not show in the diagram\) Dispatcher discards the Function Job instance once the function has completed - or potentially timedout.

## Binding to NATS

Binding to NATS was the final piece of the puzzle and once again this was very easy thanks to the simplicity of NATS Node.js client library and the Apcera platform. A couple more commands then made it possible to manage the NATS subject to function name binding.

`$ apc-fn nats bind -s myfunction.lambda -f myfunction`

Publishing messages to NATS is very simple using a telnet session.

```text
telnet demo.nats.io 4222
sub reply-box 200
+OK
pub myfunction.lambda reply-box 0
<cr>
MSG reply-box 200 5
hello
```

![](https://github.com/nats-io/nats-site/tree/c42c46a7c6b8669e66e28419887d2f8dd29aa502/img/blog/NATS_Lambda_Image_2.png)

## Conclusion & Futures

Implementing a λ framework in Apcera was very easy, as was connecting it up to NATS.

As with AWS Lambda, the benefits of this approach are the simplicity of development and deployment relative to creating full blown cloud native applications, even using something as simple as Node.js / Express, and that the compute resource utilisation is kept to the minimum whilst also expressing your code in a manner that is highly scalable and fault tolerant.

In addition to AWS Lambda, the Apcera / NATS / λ framework enables functions to be executed in multiple clouds \(including on-premise\) in accordance with overarching governance policies, resource availability, latency and service access requirements.

## Where next?

We're in the process of event-enabling everything.. Watch this space...!

## How to get involved in NATS

The \[NATS Community Page\] \([http://nats.io/community/](http://nats.io/community/)\) is a great place to start - join and learn more from others in the community using NATS!

