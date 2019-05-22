# contributing

+++ title = "NATS Contributor Guide" category = "concepts" showChildren=true \[menu.main\] name = "How To Contribute" weight = 2 identifier = "doc-contributing" parent = "Getting Started With NATS" +++

## Introduction

Do you want to contribute to NATS? Awesome! We’d love your help. To make it easier for you to contribute, we’ve provided some guidelines below to ensure that you \(the contributor\) know what we \(the project maintainers\) look for in terms of content as well as the criteria and procedures we use when reviewing your submissions.

### A Word On Governance

NATS is governed by a small, dedicated and experienced team of maintainers. This team decides which contributions are accepted and included in releases, based largely on input and feedback from the community. In this role, our principal goal is to ensure that NATS adheres to its \[Design Goals\] \(\#designgoals\) while welcoming and facilitating broad contribution from the growing NATS user community.

When discussing GitHub procedures, we’ll use the term “committers” to refer to this group.

##  NATS Design Goals and Philosophy

NATS is designed with four goals in mind:

* Performance - achieve the highest message throughput and lowest latency possible
* Stability - "always on". Nothing we put in NATS should cause it to crash, and NATS should guard itself against unruly client behavior that might compromise performance or availability for all clients.
* Simplicity - a compact, simple, and easily mastered API that requires no knowledge about the implementation of the broker \(`nats-server`\), and a broker that is lightweight, requiring minimal configuration, system resources and external dependencies.
* Security - NATS supports basic security features: authentication, authorization and encryption \(TLS\) 

##  Talking to Other NATS Users and Contributors

| Stack Overflow |  We regularly monitor [NATS questions](https://stackoverflow.com/search?tab=newest&q=NATS.IO) and so do many other knowledgeable NATS users. |
| :--- | :--- |
| Slack |  The NATS Slack team at **natsio.slack.com** is a great place to ask and answer questions about the NATS project and ecosystem and to compare notes with other users. We welcome your contribution to the discussion there, especially in sharing your experiences implementing with NATS and answering the questions of other users. You can request an invitation to join via the Slack icon on our [Community page](http://nats.io/community/). |
| Google Group |  The [natsio](contributing.md) Google group is for contributors and other people contributing to the NATS project. You can join them without a google account by sending an email to [natsio+subscribe@googlegroups.com](mailto:natsio+subscribe@googlegroups.com). After receiving the join-request message, you can simply reply to that to confirm the subscription. |
| Twitter \(@nats\_io\) |  You can follow [NATS.IO's Twitter feed](https://twitter.com/nats_io/) to get updates on our project\(s\). You can also tweet us questions or just share blogs or stories. |

## Contributing A Blog Post

We’d love to highlight your NATS implementations or insights on the NATS blog \([http://nats.io/blog](http://nats.io/blog)\). If you have a submission you'd like us to consider, please contact info@nats.io. Here are some basic guidelines for submissions: Markdown is the preferred format, although we can work with you on other formats. Try to keep your submission to 3-4 paragraphs in length. Sometimes lengthy blog posts are better served as several smaller ones. As context for your blog post, please share a bit about your role, and what your company/organization does before getting into your technical content. Logical architecture diagrams or similar visuals are really helpful! People are visual, especially when thinking about and discussing systems architecture. Sharing how you did this process before NATS, and how it works with NATS \(and what the results have been\) is useful to the reader. If possible, give a bit of context on where you hope to go next with your NATS deployment\(s\).

The NATS website is open source; GitHub users are encouraged to fork/clone and submit their proposed blog entry as a Pull Request against [https://github.com/nats-io/nats-site/tree/master/content/blog](https://github.com/nats-io/nats-site/tree/master/content/blog) to accelerate the review cycle!

## Contributing Documentation Changes

Our project documentation is available on the [NATS.IO website](http://nats.io). The source for the documentation, in markdown, can be found in the site's GitHub project [https://github.com/nats-io/nats-site](https://github.com/nats-io/nats-site).

To contribute changes, simply fork/clone the project, find the appropriate markdown file under `nats-site/content/documentation`, edit the file\(s\), and submit a Pull Request. Please ensure you've reviewed your changes for visual formatting/rendering using the instructions contained in the site's [README](https://github.com/nats-io/nats-site#install-hugo).

We will apply common-sense criteria to the review of these documentation-related pull requests:

* Correct grammar and spelling
* Correctness of content
* Relevance to subject matter
* Duplication of existing content

## Contributing By Testing

We write tests for every new feature and update them for every change. We test each push and every pull request using Travis CI and other relevant CI platforms. However, there's no such thing as too much testing! We test releases primarily on individual laptops, Docker images and Travis CI, but it's unlikely that we hit every possible combination of environments. Please test our releases in your environment and report any issues you run into via any of the avenues described in this document \(preferably GitHub Issues\).

## Contributing Code

### Choosing What To Contribute

NATS is a small but ambitious project with a similarly small dedicated core team. Review of any proposed change can be a very time consuming task, and there will be times when our available bandwidth for PR review is limited. Therefore everyone benefits if submissions are useful, clear, easy to evaluate, and already pass basic checks.

If you are eager to contribute, but you're just not sure-what _to contribute, please check the GitHub Issues for the relevant project for open issues labeled \[\*help wanted_\]\([https://github.com/issues?utf8=✓&q=org%3Anats-io+is%3Aopen+is%3Aissue+label%3A"help+wanted"](https://github.com/issues?utf8=✓&q=org%3Anats-io+is%3Aopen+is%3Aissue+label%3A"help+wanted")\). You may also ask in the [NATS Google group](https://groups.google.com/forum/#!forum/natsio) or the [NATS Slack team](http://natsio.slack.com). If you need to join, you can request an invitation to join via the Slack icon on our [Community Page](http://nats.io/community/).

Before you get started, please consider whether the proposed change is likely to be relevant, new and actionable.

* Is it clear that code must change? In other words, has a clear problem or change been identified? As with most software projects, many issues that new users run into are rooted more in their understanding of how to use the software than in actual defects or limitations of the software. 
* Check to see if there is history behind your proposal. Search the project's GitHub Issues and the [NATS Google group](https://groups.google.com/forum/#!forum/natsio) for relevant discussions.  Often, the problem has been discussed before, with a resolution that doesn’t require a code change, or recording what kinds of changes will not be accepted as a resolution. If you don't find anything in either of those places, ask in the \#general channel of the [NATS Slack team](http://natsio.slack.com) to see if anyone has anything to say.
* If you’re considering modifying code that is in the data path \(i.e. central to message flow in the server or in the client\), have you taken time to understand why the current implementation was chosen? Fixing a typo is straightforward, but the core logic and algorithms of the NATS server \(`nats-server`\) are the result of a significant amount of combined experience developing and supporting messaging solutions. That doesn't mean they're flawless, but please know that changes in this area will be scrutinized closely against performance and stability concerns. We suggest that If you're uncertain why the existing code is written in a particular way, or what the impact of your proposed change\(s\) might be, ask questions of the NATS team via Slack or the Google group.

###  Code Review Criteria

Knowing what's likely to be accepted or rejected and-why\* is a key consideration in deciding whether and what to contribute. The criteria below are things we think about and look for in any proposed change. We have Performance, Stability, Simplicity, and Security in mind at all times.

Simply put, changes that have many or large positives, and few negative effects or risks, are much more likely to be merged, and merged quickly. Risky and less valuable changes are very unlikely to be merged, and may be rejected outright rather than receive iterations of review.

#### Pluses

* Fixes the root cause of a bug in existing functionality
* Adds functionality or fixes a problem needed by a large number of users
* Simple, targeted
* Maintains or improves consistency across supported API languages
* Easily tested; has tests
* Reduces complexity and lines of code
* Change has already been discussed and is known to the committers

#### Minuses

* Non-optional new functionality that negatively affects performance 
* Band-aids a symptom of a bug only
* Introduces complex new functionality, especially an API that needs to be supported
* Adds complexity that only helps a niche use case
* Adds user-space functionality that does not need to be maintained as part of NATS
* Changes a public API or semantics \(rarely allowed\)
* Adds large dependencies
* Changes versions of existing dependencies
* Adds a large amount of code
* Is not modular/targeted -- makes lots of modifications in one “big bang” change
* Breaks existing tests \(implying your change is not backwards compatible\)
* Code coverage decreases \(implying you didn’t add sufficient tests for new/changed code\)

## Contributing Code Changes and Proposing New Features

Please review the preceding section before proposing a code change. This section documents how to do so.

###  GitHub Issues

GitHub Issues are used to describe what should be fixed or changed, and high-level approaches, while Pull Requests describe how to implement that change in the project’s source code.

For swift consideration, we suggest that you search to see if someone has already submitted this \(or a closely related\) issue. Is your issue truly unique? Has it already been discussed and rejected? Is there an open issue that would cover yours with only a minor refinement?

#### Defect Reports

If you have a unique issue, please be as descriptive as possible:

* Use a short, descriptive title that gives a clue what the Issue is about
* Describe \(if applicable\) the environment you're running on \(OS, hardware, VM, Docker, etc\)
* Describe what version \(if applicable\) of `nats-server` or relevant client libraries you're using
* Give a detailed description of the problem and why you view it as a problem.
* Whenever possible,-_please\*_ include a [Minimal, Complete, and Verifiable example](http://stackoverflow.com/help/mcve)
* If relevant, include or attach screenshots
* If relevant, include log output of `nats-server` \(obtained by running `nats-server <other options> -DV`. Trimming the log output to the relevant time period is always appreciated.
* If you have a unique issue you deem may include a vulnerability that would affect a broad user base in a highly negative or impactful way, you may log such issues privately to the NATS team via email [info@nats.io](mailto:info@nats.io), private direct message on [NATS Slack](https://natsio.slack.com) or private direct message on [NATS Twitter](https://twitter.com/nats_io).

#### Change Proposals and Feature Requests

When submitting a new Issue for a change proposal or feature request, tell us-why _the change is necessary. State the use case \(e.g. "As a **\_**, I need to **\_\_**"\)_ without\* assuming any particular implementation. Stating only that "NATS should... \(do some new technical thing\)" is about as useful as stating that your car should be a tractor :\) Help us understand the real problem you're trying to solve, in terms of the problem itself.

### Pull Requests

Please ensure that your Pull Request references an existing GitHub Issue that describes the defect or requirement that is addressed by the Pull Request. If a relevant Issue doesn’t exist, please create one.

We follow standard GitHub procedures for creating and processing pull requests.

1. [Fork](https://help.github.com/articles/fork-a-repo/) the relevant Github repository, e.g. `http://github.com/nats-io/nats-server` if you haven’t already.
2. Clone your fork, create a new branch, push commits to the branch.
3. Consider whether documentation or tests need to be added or updated as part of the change, and add them as needed.
4. Run all tests to verify that the code still compiles, passes tests, and passes style checks. If style checks fail, review the relevant Code Style Guide in the project you're working in. It’s also advisable to ensure that any checks found in `.travis.yml` run successfully on your local system, when possible. These often include code formatting and static analysis checks that may cause CI tests to fail.
5. Open a pull request against the `master` branch of the relevant project \(e.g. `nats-io/nats-server`\). \(Only in special cases would the PR be opened against other branches.\)
   * The PR title should be of the form `[ADDED | FIXED | CHANGED | UPDATED] <description>`
     * `ADDED` - a new feature or content was added
     * `FIXED` - a defect in existing behavior was resolved
     * `CHANGED` - existing non-broken behavior was changed
     * `UPDATED` - new behavior was added to an existing behavior \(could also be considered `CHANGED`, but please think about which tag you use\)
   * If the pull request is still a work in progress, and so is not ready to be merged, but needs to be pushed to GitHub to facilitate review, then prepend `[WIP]` to the PR title, and if needed ping \(`/cc @user`\) the relevant reviewer\(s\) for advice, or contact them via Slack.
   * Consider identifying committers or other contributors who have worked on the code being changed. Find the file\(s\) in Github and click “Blame” to see a line-by-line annotation of who changed the code last. You can add @username in the PR description to ping them immediately.
   * Please state that the contribution is your original work and that you license the work to the project under the project’s open source license.
6. Travis CI will automatically build and test your changes. This should be a relatively quick process, and will report any errors as well as code coverage changes within a few minutes.
7. Watch for the results, and investigate and fix failures promptly. PRs with failing tests will not be reviewed or accepted.
   * Fixes can simply be pushed to the same branch from which you opened your pull request
   * Travis CI will automatically re-test when new commits are pushed
   * If the tests failed for reasons unrelated to the change \(e.g. timing issues in Travis\), the test can usually be re-run in Travis. Ask a committer if you need a test restarted, or if there are any other test failures that you believe are not related to your change\(s\).
   * Sometimes, other changes will be merged which conflict with your pull request’s changes. The PR can’t be merged until the conflict is resolved. This can typically be resolved with `git pull --rebase origin master` and resolving the conflicts by hand, then pushing the result to your branch.
   * Try to be responsive to the discussion rather than let days pass between replies.
8. Squash your changes to a single commit as described [here](http://gitready.com/advanced/2009/02/10/squashing-commits-with-rebase.html).
9. Remember to remove `[WIP]` from your PR title once it is ready for submission, otherwise it will be ignored.

### Review Process

* The review process will begin only when all CI tests are green.
* Other reviewers, including committers, may comment on the changes and suggest modifications. Changes can be added by simply pushing more commits to the same branch.
* Lively, polite, rapid technical debate is encouraged from everyone in the community. The outcome may be a rejection of the entire change.
* Reviewers can indicate that a change looks suitable for merging with a comment such as: “I think this patch/pull/change looks good”, or, more succinctly, "LGTM" \(looks good to me\).
* Generally we require LGTMs by at least two committers in order to approve a change for merge. There may be cases where this varies depending on size/scope/complexity of the change.
* Sometimes, other changes will be merged which conflict with your pull request’s changes. The PR can’t be merged until the conflict is resolved. This can typically be resolved with `git pull --rebase origin master` and resolving the conflicts by hand, then pushing the result to your branch.

### Closing Your Pull Request

* If accepted, your pull request will be automatically closed once the change is merged into `master`
* If your pull request is rejected, the committers will close your PR.
* If committers have requested changes or further information from you, and you do not respond within a reasonable timeframe, your PR may be closed at our discretion.

## Code Style Guide

NATS follows widely-adopted standards for code formatting and style in each implementation language. Please refer to the `CONTRIBUTING.md` in individual NATS projects for specifics that apply to each.

## Acknowledgements

_"If I have seen further, it is by standing on the shoulders of giants."_

* Sir Isaac Newton

In preparing this guide, we gratefully borrowed ideas and words from the contribution guidelines of other popular open-source projects such as Apache Spark, Redis, and Docker. We thank them for inspiring us.

