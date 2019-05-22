# Untitled

{% tabs %}
{% tab title="GO" %}


```go
nc, err := nats.Connect("demo.nats.io")
if err != nil {
	log.Fatal(err)
}
defer nc.Close()

getStatusTxt := func(nc *nats.Conn) string {
	switch nc.Status() {
	case nats.CONNECTED:
		return "Connected"
	case nats.CLOSED:
		return "Closed"
	default:
		return "Other"
	}
}
log.Printf("The connection is %v\n", getStatusTxt(nc))

nc.Close()

log.Printf("The connection is %v\n", getStatusTxt(nc))
```
{% endtab %}

{% tab title="Java" %}


{% code-tabs %}
{% code-tabs-item title="java.md" %}
```java
Connection nc = Nats.connect("nats://demo.nats.io:4222");


System.out.println("The Connection is: " + nc.getStatus());

nc.close();

System.out.println("The Connection is: " + nc.getStatus());
```
{% endcode-tabs-item %}
{% endcode-tabs %}
{% endtab %}
{% endtabs %}



