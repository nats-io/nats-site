# <a name="about"></a>NATS.io

This repo houses the code for the NATS site at [https://nats.io](https://nats.io). NATS documentation is not included in this repo, see the [nats.docs](https://github.com/nats-io/nats.docs) or [https://docs.nats.io](https://docs.nats.io)]

The NATS website is based on the [Hugo](https://gohugo.io) framework using the  [Bulma](https://bulma.io) CSS framework. The content structure is designed to be simple, informative, intuitive and fast -- just like NATS!
Please keep these principles in mind as you modify existing content or design new content for the [nats.io](https://nats.io) site.

---

## Contents

- [Contributing Content](#contributing-content)
- [General Style Guidelines and Conventions](#general-style-guidelines-and-conventions)
- [Content Organization](#content-organization)
- [Adding Documentation](#adding-documentation)
- [Adding Content Pages](#adding-content-pages)
- [Adding Clients](#adding-clients-and-utilities)
- [Adding a Blog Entry](#adding-a-blog-entry)
- [Adding a Company Logo](#adding-a-company-logo)
- [Local Development](#local-development)

---

## Contributing content

We view this project as a perpetual work in progress that can greatly benefit from and be enriched by the knowledge, wisdom and experience of our community.

We follow the standard Fork-and-Branch GitHub workflow.
If you're not familiar with this process, please refer to either of the following excellent guides:

- ['Forking Projects' GitHub Guide](https://guides.github.com/activities/forking/)
- ['Fork a Repo' GitHub Help article](https://help.github.com/articles/fork-a-repo/)

We encourage and welcome your contributions to any part or element of this site.
We will review and discuss with you any contributions or corrections submitted via GitHub Pull Requests.

---

## General Style Guidelines and Conventions

### Markdown guidelines

- Use topic-based files and titles
- Use only headers 1 (#), 2 (##) and 3 (###)
- Use single spaces to separate sentences
- Markdown syntax: https://daringfireball.net/projects/markdown/syntax#img
	- Links: `[NATS](https://nats.io/)`
	- Cross references: `[Clients](/clients/)`
	- Images: `![drawing](/img/nats-msg.png)`
- Triple ticks for code, commands to run, user operations, input/output
- Single ticks for executable names, file paths, inline commands, parameters, etc.
- Graphics: save as `*.png`; source in `/src/img/*` depending what you are using the image for; blog, about, etc.

---
## Content Organization

The basic organization of the site is very simple, with each top navigation link corresponding to a Markdown file in the `nats-site/content` directory.
The HTML documents and any Markdown documents contained in this directory are assembled by Hugo and rendered to static HTML during the build process.

The structure of the content directory is as follows:

```
- /content
	- /blog
	- /download
	- about.html
	- community.md
	- contributing.md
	- privacy.md
	- support.html
```

The **html files** or **directories** should be pretty self-explanatory for what pages they are used for.

---

## Adding Documentation

The NATS documentation has moved to the [nats-io/nats.docs](https://github.com/nats-io/nats.docs/) repo.

## Adding Content Pages

Any new page should be a raw Markdown document placed in the appropriate content directory listed above. 

## Adding Clients and Utilities

To add a new NATS Client or Utility, add to the applicable data file
* Add/update NATS Clients - `languages.toml`
* Add/update NATS Connectors & Utilities - `addons.toml`


## Adding a Blog Entry
To add a new blog entry, use the `hugo new` command like the following:

```
	hugo new blog/page-url-for-blog-post.md
```

Replace `page-url-for-blog-post` with a SEO (Search Engine Optimization) friendly page url like: `nats-lands-in-london`. So the resulting command would be: `hugo new blog/nats-lands-in-london`. Then new blog entry would reside at: `https://nats.io/blog/nats-lands-in-london`

Once the command is run you can find the new blog entry in `content/blog/nats-lands-in-london.md`.

In the frontmatter of the new entry you will see metadata like this:

```
+++
date = "2019-12-01"
draft = true
title = "NATS Lands in London"
author = "Esteemed NATS Thought Leader"
categories = ["Engineering"]
tags = ["NATS"]
+++
```

Make sure to update the page metadata to reflect the specifics of your post (author, targeted publish date, etc.).

By default, `draft = true` is set on blog posts. When a post has this status, it won't be published to the production site, but it will be viewable via the Netlify deploy preview. The following must be true for a post to go live on the site:

* The post's date must not be in the future
* The `draft` parameter must be set to `false` or not be present

### Categories
For Categories you are going to add on or more of the following:

- General
- Engineering
- Community

So for our example we would change `categories` in the frontmatter to:

```
	categories = ["Community"]
```

### Date
The date timestamp should be the exact time you ran the command to create the new blog entry. If you need to change it make sure you follow the same convention that is already there. `date = "2015-11-05T11:45:03-08:00"`. The date cannot be in the future.

### Tags
For Tags, you can add as many tags as you feel are needed and they can be anything:

```
	tags = ["nats","london","community"]
```

### Title
A default title is generated from the url you provided with the `hugo` command but we recommend you change this to something better suited for display purposes. Example: `title = "NATS Lands In London"`

### Blog Entry Content

#### Images
To add images to a blog entry, first place them in `/src/blog/*`. You will need to create a folder in `src/blog/` with the same title as your post. You may add images of any size, but please make sure they are at least 800x600 for quality purposes.

You may link to these images then. Example: `<img src="/img/blog/<your blog folder>/IMAGE-NAME.png">`

#### Embedded Tweets
To add an embedded tweet, you just need to grab the embed code from the tweet, and then wrap the embed code in a div as follows:

```
	<div class="tweet-embed-con">
	  <!-- Twitter Embed code goes here -->
	</div>
```

Check out the blog entry `/content/blog/nats-lands-in-london.md` for a detailed example.

---

## Adding a Company Logo
If you are a production end user of NATS and would like your company logo displayed on our [Home](https://nats.io/) page, please email [info@nats.io](mailto:info@nats.io) with your request. 

---

## Local Development

You can either user docker image for your local development or install requirements following this documentation.


Clone your forked copy of the repository:
```
git clone git@github.com:<YOUR GIT USERNAME>/nats-site.git
```

Change to the directory:
```
cd nats-site/
```

#### Install Prerequisites

Install [Hugo](https://gohugo.io/), [npm](https://docs.npmjs.com/getting-started/installing-node). 

> Building the NATS site/documentation currently requires Hugo version 0.80 or higher. Installation instructions can be found [here](https://gohugo.io/getting-started/installing).


#### Building the Site

See the makefile for run commands.


Thank you for your interest in NATS!
