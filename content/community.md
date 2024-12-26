+++
title = "Community"
+++

Our NATS community consists of company end-users, partners, and OSS contributors that make up a vibrant ecosystem.
If you’d like to help make NATS and its resources better, check out the [Ways to Contribute](#contribute) below. Chances are, if you find a feature useful, others will too.

---
{{< columns >}}
{{< column >}}
## Social

Join us on any of our social platforms to learn, share, and connect with NATS.


{{< buttons/social >}}


## Ways to Contribute {#contribute}

The best way to get started contributing to NATS is to read our [Contributor's Guide](/contributing). Here are some examples of how you can contribute:

* Report or fix bugs
* Add or propose new features
* [Improve our documentation](https://github.com/nats-io/nats-site#adding-documentation)
* Add or update client libraries
* <a href="mailto:info@nats.io?subject=Host a NATS MeetUp">Host a Meetup</a>
* [Improve this website](https://github.com/nats-io/nats-site)

Please [contact us](mailto:info@nats.io) with any other suggestions.
{{< /column >}}
{{< column >}}

## Branding

NATS is an open source project hosted by the CNCF. All colors, logos, and styles should be used as governed by the Linux Foundation/CNCF.

* [NATS Logo Colors and Images](https://github.com/cncf/artwork/blob/master/examples/incubating.md#nats-logos)
* [CNCF Style Guide](https://github.com/cncf/artwork#cncf-brand-guidelines)

## NATS Newsletter

Stay up to date with the latest information on NATS.


<script>
  function handleNewsletterFormSubmit(e) {
    e.preventDefault();
    let email = document.getElementById("email").value;
    const portalId = "47270392";
    const formId = "b0a5d839-3b24-4e00-8b4c-fab17593f791";
    const url = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;
    var data = {
      email: email,
    };

    const errorMessage = "An error has occurred upon submission.";
    const successMessage = "Thank you for subscribing!";

    const payload = {
      fields: [
        {
          name: "email",
          value: email,
        },
      ],
      context: {
        pageUri: window.location.href,
        pageName: document.title,
      },
    };

    fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then(function (response) {
        if (response.ok) {
          document.getElementById("subscribe-message").style.display = "block";
          document.getElementById("subscribe-message").style.color = "green";
          document.getElementById("subscribe-message").innerText =
            successMessage;
        } else {
          document.getElementById("subscribe-message").style.display = "block";
          document.getElementById("subscribe-message").style.color = "red";
          document.getElementById("subscribe-message").innerText = errorMessage;
        }
      })
      .finally(() => {
        document.getElementById("subscribe-form").reset();
      });
  }
</script>

{{< newsletter >}}


{{< /column >}}
{{< column >}}


## Coming Events

Join us at our upcoming events and talks. Have a suggested event or want us to join yours? Let us know [info@nats.io](mailto:info@nats.io).

{{< event-list >}}
{{< /column >}}
{{< /columns >}}

---

## NATS Ambassador Program

The NATS Ambassador Program celebrates people who have demonstrated significant value in the NATS community, by developing a track record of providing valuable help through community channels as well as contributing to issues and discussions, reporting detailed bugs, suggesting code changes, and improving the NATS documentation.

{{< columns >}}
{{< column >}}

### How to become an ambassador

- Current NATS maintainers and ambassadors can suggest a candidate
- A semi-annual vote occurs among the maintainers and ambassadors
- The person is elected and voted in as a NATS Ambassador

{{< /column >}}
{{< column >}}

### Once you are chosen as an ambassador

You will -
- Be added to the [AMBASSADORS.md](https://github.com/nats-io/nats-server/blob/main/AMBASSADORS.md) file in the nats-io/nats-server repo
- Be added to the NATS community page with your picture and bio
- Receive unique ambassador swag 😊
- Receive a complimentary conference registration
- Participate in an optional review of the NATS roadmap
- Participate in an optional quarterly call with the NATS maintainers

{{< /column >}}
{{< /columns >}}

## Current NATS Ambassadors

{{< ambassadors >}}

---

## Partners

We work with a variety of companies to ensure NATS is delivered in a broad range of solutions used by our community. [Contact us to Partner](mailto:info@nats.io?Subject=Partner%20inquiry).

{{< partners >}}
