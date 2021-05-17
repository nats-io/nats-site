+++
categories = ["Clients", "Kotlin", "Java"]
date = "2021-05-15"
tags = ["java", "koltin", "android"]
title = "Java client usage on Android with Kotlin"
author = "Iván Ferro"
+++

## Dependencies
To use the official [NATS.java](https://github.com/nats-io/nats.java) library in Android we need to add the dependency to the ***build.gradle*** file at ***Module*** level. Please use the latest released version, which at this writing is 2.11.2

```xml
dependencies {
    //other dependencies
    implementation 'io.nats:jnats:2.11.2'
}
```

## Implementation

We will create a class as a manager to control our NATS client to be able to connect, disconnect, publish ... This is necessary because when Nats.java tries to connect, it makes a blocking call, which we don't want in the main thread, so we execute it in another thread. Also, in order to have communication between the main thread and connect thread, we generate an interface that we will implement in the MainActivity and that we pass as parameter to our class NatsManager. In this case, we will make that the interface returns us when we are connected and what messages it revokes.

```kotlin
open interface IDataCollector {
    fun setConnect(connect: Boolean)
    fun setResponse(response: String)
}

class MainActivity : AppCompatActivity(), IDataCollector {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val hide = supportActionBar?.hide()

        setContentView(R.layout.activity_main)

        text = findViewById(R.id.response)
        text.text = responses

        nats = NatsManager(this)

        var btn : MaterialButton = findViewById(R.id.connect)
        btn.setOnClickListener { nats.connect() }

        var btn2 : MaterialButton = findViewById(R.id.pub)
        btn2.setOnClickListener { nats.pub("test", "THIS IS A TEST MSG") }
    }

   
   // . . . 

    override fun setConnect(connect: Boolean) {
        val natsGreenBar: LinearProgressIndicator = findViewById(R.id.connectIndicator)
        if(connect == true){
            natsGreenBar.setIndicatorColor(Color.parseColor("#23B221"))
            natsGreenBar.visibility= View.VISIBLE
        }
    }

    override fun setResponse(response: String) {
        responses = responses+response+"\n"
        println(responses)
        text.text= responses
    }


}

```

```kotlin
class NatsManager(datacollector: MainActivity) {

    val TAG = "Nats Service"
    lateinit var nc : Connection
    val datacollector = datacollector

    // . . . 
}

```

In this example we are going to create a method ***connect*** that is going to connect to the server with the options that we indicate. Once connected it is going to subscribe to the subject ***test***. As we said before, we need that the instruction ***Nats.connect()*** goes inside a new thread. Initializing from this the variable nc, being thus accessible from the main thread.

```kotlin
 fun connect() {
        Log.d(TAG, "TRY TO CONNECT")
        Thread {
            val options: Options = Options.Builder().server("nats://demo.nats.io:4222").build()

            try {
                nc = Nats.connect(options)
                Log.d(TAG, "Connected to Nats server ${options.servers.first()}")
                connect= true
                datacollector.setConnect(true)


                val d = nc.createDispatcher { msg: Message? -> }

                val s = d.subscribe("test") { msg ->
                    val response = String(msg.data, StandardCharsets.UTF_8)
                    datacollector.setResponse(response)
                    println("Message received (up to 100 times): $response")
                }


            } catch (exp: Exception) {
                println(exp.printStackTrace())
                connect = false
                datacollector.setConnect(false)
            }
        }.start()

    }
```

To create a publication method we just have to call the Nats.java function, passing as parameters the subject and message in ByteArray.

```kotlin
fun pub(topic: String, msg: String){
        nc.publish(topic, msg.toByteArray(StandardCharsets.UTF_8))
        Log.d(TAG, "Published msg ${msg} on topic ${topic}")
    }
```

In this way we have a functional client in Android using the official nats java library in a very simple way.
You can check the complete code [here](https://github.com/nats-io/kotlin-nats-examples/tree/main/simple-android-app)

## About the Author

Iván Ferro is a member of research and development team **COM** at [University of Vigo](https://www.uvigo.gal/).


