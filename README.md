# NATS documentation

This repository contains the source content for http://nats.io/documentation.
The [nats.io](http://nats.io) website is built from Markdown content using [Hugo](gohugo.io), a static site generator written in [Go](http://golang.org/).

This documentation repository and the [main repository for the nats.io site](github.com/nats-io/nats-site) share a [common CSS theme submodule](http://github.com/nats-io/nats-theme/).

## Contributing content

We view this project as a perpetual work in progress that can greatly benefit from and be enriched by the knowledge, wisdom and experience of our community.
 
We follow the standard Fork-and-Branch GitHub workflow.
If you're not familiar with this process, please refer to either of the following excellent guides:

- ['Forking Projects' GitHub Guide](https://guides.github.com/activities/forking/)
- ['Fork a Repo' GitHub Help article](https://help.github.com/articles/fork-a-repo/)

We encourage and welcome your contributions. 
We will review and discuss with you any contributions or corrections submitted via GitHub Pull Request.


### Content Organization

The NATS documentation is a collection of Markdown articles located in `nats-docs/content and organized into the following categories/subdirectories:


| Category        | Subirectory
|-----------------|----------------
| Getting Started | `documentation` 
| Clients         | `documentation/clients`
| Concepts        | `documentation/concepts`
| Internals       | `documentation/internals`
| Tutorials       | `documentation/tutorials`


The Markdown documents contained in these directories are assembled by Hugo and listed in their respective categories in a navigation menu at the left side of every page. 

### Adding pages

Any new page should be a Markdown document placed in the appropriate directory. Each page added needs a header like the following:

```
+++
date = "2015-01-02"
title = "Title of Page"
category = "nats-docs/folder"
weight = 1
+++
```

- Date format: Year-Month-Day
- Title: Title of the page
- Category: Directory path to file
- Weight: When listing pages it signifies its importance and where it should land in the list.
- Description: Optional

### Adding categories

Modify `nats-docs/config.toml` to add the category and its weight (list position) to menu.main:

```
[[menu.main]]
  name = "getting started"
  weight = 0
[[menu.main]]
  name = "clients"
  weight = 1
[[menu.main]]
  name = "concepts"
  weight = 2
[[menu.main]]
  name = "internals"
  weight = 3
[[menu.main]]
  name = "server"
  weight = 4
[[menu.main]]
  name = "tutorials"
  weight = 5
```

## Style guidelines and conventions for documentation

- Use topic-based files and titles
- Use only headers 1 (#), 2 (##) and 3 (###)
- Use single spaces to separate sentences
- Markdown syntax: http://daringfireball.net/projects/markdown/syntax#img
	- Links: `[NATS](http://nats.io/)`
	- Cross references: `[client libraries](/documentation/clients/nats-clients/)`
	- Images: `![drawing](/documentation/img/nats-msg.png)`
- Triple ticks for code, commands to run, user operations, input/output
- Single ticks for executable names, file paths, inline commands, parameters, etc.
- Graphics: save as *.png; source in /content/documentation/img/nats-img-src.graffle

## Checking your work

To make sure your changes render correctly, you can build and preview the site on your local system using Hugo. 
One great thing about Hugo is that it has a live preview mode. In live preview mode, Hugo spawns a web server that detects content updates in the tree and will re-render the Markdown to HTML in real time. This means you can see the updated content and layout in real time as you edit!


###Install HUGO:
**Note 1:** On OS X, if you have [Homebrew](http://brew.sh), installation is even easier: just run `brew install hugo`.


**Note 2:** Hugo requires Go 1.4+. If Go is not already installed on your system, you can [get it here](https://golang.org/dl/).

Now install Hugo:
```
go get -u -v github.com/spf13/hugo
```

Clone your forked copy of the repository:
```
git clone git@github.com:<YOUR GIT USERNAME>/nats-docs.git
```

Change to the directory:
```
cd nats-docs/
```

Initialize the nats-theme submodule:
```
git submodule init
```

If this is the first time, pull in the nats-theme submodule:

```
git submodule update
```
Or, if the linked nats-theme submodule (repo) has changed since first pulling it in:
```
git submodule foreach git pull origin master
```

Build the site and start the server:
```
hugo server -w --port=1414 --theme=nats --buildDrafts
```
