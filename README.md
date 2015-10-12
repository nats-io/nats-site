# nats.io

This repository contains the source content for http://nats.io.
The [nats.io](http://nats.io) website is built from raw HTML and Markdown content using [Hugo](gohugo.io), a static site generator written in [Go](http://golang.org/).

This repository and the [documentation repository for the nats.io site](github.com/nats-io/nats-docs) share a [common CSS theme submodule](http://github.com/nats-io/nats-theme/).

## Contributing content

We view this project as a perpetual work in progress that can greatly benefit from and be enriched by the knowledge, wisdom and experience of our community.
 
We follow the standard Fork-and-Branch GitHub workflow.
If you're not familiar with this process, please refer to either of the following excellent guides:

- ['Forking Projects' GitHub Guide](https://guides.github.com/activities/forking/)
- ['Fork a Repo' GitHub Help article](https://help.github.com/articles/fork-a-repo/)

We encourage and welcome your contributions to any part or element of this site. 
We will review and discuss with you any contributions or corrections submitted via GitHub Pull Request.


### Content Organization

The basic organization of the site is very simple, with each top navigation link corresponding to a single HTML or Markdown file in the `nats-site/content` directory. 
The HTML documents and any Markdown documents contained in this directory are assembled by Hugo and rendered to static HTML during the build process.

### Adding pages

Any new page should be a raw HTML or Markdown document placed beneath the `content` directory. Each page added needs a header like the following:

```
+++
date = "2015-01-02"
title = "Title of Page"
+++
```

- Date format: Year-Month-Day
- Title: Title of the page

In the current design, adding a new page to the main menu requires adding that page's title to the `mainMenu` array in `config.toml`:

```
baseurl = "http://nats.io/"
languageCode = "en-us"
title = "NATS by Apcera"

[params]
  leftNav = false
  description = "NATS - NATS was created as a central nervous system for cloud native and distributed systems, and provides the foundation for modern, reliable, and scalable cloud and distributed systems."
  author = "The NATS team"
  mainMenu=[ "home", "download", "clients", "documentation", "support", "community" ]
```


## Style guidelines and conventions for Markdown

- Use topic-based files and titles
- Use only headers 1 (#), 2 (##) and 3 (###)
- Use single spaces to separate sentences
- Markdown syntax: http://daringfireball.net/projects/markdown/syntax#img
	- Links: `[NATS](http://nats.io/)`
	- Cross references: `[Clients](/clients/)`
	- Images: `![drawing](/img/nats-msg.png)`
- Triple ticks for code, commands to run, user operations, input/output
- Single ticks for executable names, file paths, inline commands, parameters, etc.
- Graphics: save as `*.png`; source in `/src/img/nats-brokered-throughput-comparison.png`

## Checking your work

To make sure your changes render correctly, you can build and preview the site on your local system using Hugo. 
One great thing about Hugo is that it has a live preview mode. In live preview mode, Hugo spawns a web server that detects content updates in the tree and will render Markdown to HTML in real time. This means you can see the updated content and layout in real time as you edit!


###Install HUGO:
**Note 1:** On OS X, if you have [Homebrew](http://brew.sh), installation is even easier: just run `brew install hugo`.


**Note 2:** Hugo requires Go 1.4+. If Go is not already installed on your system, you can [get it here](https://golang.org/dl/).

Now install Hugo:
```
go get -u -v github.com/spf13/hugo
```

Clone your forked copy of the repository:
```
git clone git@github.com:<YOUR GIT USERNAME>/nats-site.git
```

Change to the directory:
```
cd nats-site/
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
