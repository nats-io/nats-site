+++
categories = ["Community", "Engineering"]
date = "2019-10-01"
tags = ["nats", "nsc", "technical", "ngs", "synadia","features"]
title = "Simplifying Account Management for NGS with NSC"
author = "Stephen Asbury"
+++

We are simplifying the NATS administrative experience by moving all account JWT management to `nsc` and simplifying the `ngs` tool to only manage your billing account with Synadia. The open sourced `nsc` tool can now be used to edit, view and deploy your account JWTs locally, to a nats-account-server or Synadia’s global service.

To assist in this simplification we need to migrate your current `~/.ngs` folder to `~/.nsc`. The old folder will remain in place, but will no longer be used.

Your keys should already be stored in a central location, `~/.nkeys`, or separately if you choose to manage them elsewhere.

While we won’t delete your old data, the new tools will not be able to use it in the old format. Please treat this as a one-way migration if at all possible.

While this is a fairly major change, we think that it will minimize the context switching between local and NGS accounts, and unify the tools required to manage your account across all nats-servers. Moving forward you will use `nsc` to add imports and exports, or create new users. `ngs` will only be used to edit your billing plan.

Migration is a two part process. First, you will tell `nsc` to download the current JWT for the Synadia operator using the standard `add operator` command. We have extended `nsc` to understand special named operators. You can create these in your enterprise as well, check out the [tools documentation](https://nats-io.github.io/docs/nats_tools/nsc/) to learn how. Adding the Synadia operator will set the default operator to Synadia. Using that default, we can use a hidden command in `nsc` just for this transition to migrate your existing `ngs` accounts and users to the new folder. This process will copy the JWTs for your accounts and upload them on the NGS servers. It will also copy the user JWTs. Once the migration succeeds you can archive the old folder, as you won't need it any longer.

```bash
nsc add operator -u synadia
nsc migrate --operator-dir ~/.ngs/nats/synadia
```

If you don’t have `nsc` installed, you can download the installer at [https://github.com/nats-io/nsc](https://github.com/nats-io/nsc). The latest [ngs installer](https://github.com/ConnectEverything/ngs-cli) will install `nsc` as well.

Once you migrate, you can use `nsc` to add users with `nsc add user -n steve`, while `ngs` has a small set of commands like `ngs status` and `ngs edit` to manage your Synadia billing account.

By default, Synadia provides three demo services (echo, usage, active) to new accounts through a set of automated imports added to your account JWT when you first upload it. These services can now be accessed with the `nsc` tool. In fact, `nsc` has added tools to publish, subscribe, request, reply and check round trip message times with your operator's server. These tools work with NGS but also with other operators if they are configured to include a connect URL.

The echo service returns what you send it, a standard NATS request.

```bash
% nsc tool req ngs.echo "hello world"
```

The usage service shows an approximation of your account-wide data usage.

```bash
% nsc tool req ngs.usage ""
```

The active service sends out a message stream you can subscribe to. Messages indicate known servers based on various locations in the NGS cluster.

```bash
% nsc tool sub ngs.active
```

In all three cases, the operator you see when you type `nsc env` should be Synadia, and the account and user should be the ones you want to use to run the tool.

As always `ngs --help` and `nsc --help` can be used to learn more about what the commands provide.

Thank you for using Synadia’s global messaging service.
