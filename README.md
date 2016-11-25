# <a name="about"></a>NATS.io
The site is based on the [Bootstrap](http://getbootstrap.com) framework, and the content structure is designed to be simple, informative, intuitive and fast -- just like NATS!
Please keep these principles in mind as you modify existing content or design new content for the [nats.io](http://nats.io) site.

For more information on Bootstrap's themes, conventions, and content support (HTML/CSS/JS), please visit [the Bootstrap website](http://getbootstrap.com).

===

## Contents

- [Contributing Content](#contribute)
- [General Style Guidelines and Conventions](#styleguide)
- [Content Organization](#organization)
- [Adding Documentation](#adding-documentation)
- [Adding Content Pages](#adding-content-pages)
- [Adding a Blog Entry](#adding-blog-entry)
- [Local Development](#development)

===


## <a name="contribute"></a>Contributing content

We view this project as a perpetual work in progress that can greatly benefit from and be enriched by the knowledge, wisdom and experience of our community.

We follow the standard Fork-and-Branch GitHub workflow.
If you're not familiar with this process, please refer to either of the following excellent guides:

- ['Forking Projects' GitHub Guide](https://guides.github.com/activities/forking/)
- ['Fork a Repo' GitHub Help article](https://help.github.com/articles/fork-a-repo/)

We encourage and welcome your contributions to any part or element of this site.
We will review and discuss with you any contributions or corrections submitted via GitHub Pull Request.

===

## <a name="styleguide"></a>General Style Guidelines and Conventions

### Markdown guidelines

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

===

## <a name="organziation"></a>Content Organization

The basic organization of the site is very simple, with each top navigation link corresponding to a single HTML or Markdown file in the `nats-site/content` directory.
The HTML documents and any Markdown documents contained in this directory are assembled by Hugo and rendered to static HTML during the build process.

The structure of the content directory is as follows:

```
- /content
	- /blog
	- /documentation
	- /download
	- about.html
	- community.html
	- index.html
	- support.html
```

The **html files** or **directories** should be pretty self explanatory for what pages they are used for.

===

## <a name="adding-documentation"></a>Adding Documentation

The NATS documentation is a collection of Markdown articles located in `nats-docs/content and organized into the following categories/subdirectories:


| Category        | Subirectory
|-----------------|----------------
| Getting Started | `documentation`
| Clients         | `documentation/clients`
| Concepts        | `documentation/concepts`
| Internals       | `documentation/internals`
| Tutorials       | `documentation/tutorials`

The Markdown documents contained in these directories are assembled by Hugo and listed in their respective categories in a navigation menu at the left side of every page.

### Style guidelines and conventions for documentation

- Use topic-based files and titles
- Use only headers 1 (#), 2 (##) and 3 (###)
- Use single spaces to separate sentences
- Markdown syntax: http://daringfireball.net/projects/markdown/syntax#img
	- Links: `[NATS](http://nats.io/)`
	- Cross references: `[NATS protocol](/documentation/internals/nats-protocol.md)`
	- Images: `![drawing](/img/documentation/nats-msg.png)`
- Triple ticks for code, commands to run, user operations, input/output
- Single ticks for executable names, file paths, inline commands, parameters, etc.
- Graphics: save as `*.png` source in `/src/img/documentation/nats-img-src.graffle`
- Run `gulp` in the root of the app, this will automatically place the image in the correct location for use


### Creating a new documentation page

Any new page should be a Markdown document placed inside `/content/documentation/`. Place it inside of one of the current sub folders in `/content/documentation` or add a new category/folder. Directions are below for adding a new category for documentation.

 Each page added needs a header like the following:

```
+++
date = "2015-09-27"
title = "NATS Messaging"
category = "concepts"
[menu.main]
  name = "Messaging"
  weight = 1
  identifier = "concepts-nats-messaging"
  parent = "Concepts"
+++
```

- date: Use the format of: Year-Month-Day Example: 2015-09-27
- title: Title of the page
- category: Directory path to file

For the menu portion, follow this:

- Name: Name of the menu item in the left nav
- Weight: When listing pages it signifies its importance and where it should land in the list
- Identifier: This is used behind the scenes for page generationa nd menu building. Please make sure its unique for each page
- Parent: Set this to the exact name of the category this page is is.

### Adding documentation sub categories

Modify `config.toml` to add the category and its weight (list position) to menu.main. Below you will see an example of some pre existing **categories** as well as a new category specified as: **New Category**.

```
[[menu.main]]
  name = "Documentation"
  weight = 2
  identifier = "documentation"
  url = "/documentation"
  [[menu.main]]
    name = "Getting Started"
    weight = 0
    parent = "documentation"
  [[menu.main]]
    name = "Clients"
    weight = 1
    parent = "documentation"
  [[menu.main]]
    name = "New Category"
    weight = 2
    parent = "documentation"
```

===

## <a name="adding-content-pages"></a>Adding Content Pages

Any new page should be a raw HTML or Markdown document placed beneath the `content` directory. Each page added needs a header like the following:

```
+++
date = "2015-09-01"
title = "New Page"
description = "Some page description can go here"
+++
```

- date format: Year-Month-Day
- title: Title of the page
- cssid: Page specific css id used on the body tag for page specific styles
- description: Description of the page
In the current design, adding a new page to the main menu requires adding that page's title to the `[[menu.main]]` in `config.toml`:

```
[[menu.main]]
  name = "Support"
  weight = 3
  identifier = "support"
  url = "/support"

[[menu.main]]
  name = "Community"
  weight = 4
  identifier = "community"
  url = "/community"

[[menu.main]]
  name = "New Page"
  weight = 5
  identifier = "new-page"
  url = "/new-page"
```

### Adding Quotes to Community
To add a new quote and logo to **/communnity** you are going to have to modify `/layouts/partials/quotes.html` and follow the convention as seen from the existing quotes.

If you have a logo to go along with the quote, just add a full size `.jpeg` or `.png` logo to `/src/user_logos`. Then run `gulp` in the terminal to generate the proper image size. Then link do the generated image in `static/img/user_logos`. Example: `<img src="/img/user_logos/FILENAME.EXT">`

===

## <a name="adding-blog-entry"></a>Adding a Blog Entry
To add a new blog entry, use the `hugo new` command like the following:

```
	hugo new blog/page-url-for-blog-post.md
```

Replace `page-url-for-blog-post` with a seo friendly page url like: `nats-lands-in-london`. So the resulting command would be: `hugo new blog/nats-lands-in-london`. Then new blog entry would reside at: `http://nats.io/blog/nats-lands-in-london`

Once the command is run you can find the new blog entry in `/blog/nats-lands-in-london.md`.

In the frontmatter of the new entry you will see this:

```
	+++
	categories = ["x", "y"]
	date = "2015-11-05T11:45:03-08:00"
	tags = ["x", "y"]
	title = "nats lands in london"
	
	+++
```

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
The date timestamp should be the exact time you ran the command to create the new blog entry. If you need to change it make sure you follow the same convention that is already there. `date = "2015-11-05T11:45:03-08:00"`

### Tags
For Tags, you can add as many tags as you feel are needed and they can be anything:

```
	tags = ["nats","london","community"]
```

### Title
A default title is generated from the url you provided with the `hugo` command but we recommend you change this to something is better suited for display purposes. Example: `title = "NATS Lands In London"`

### Blog Entry Content

#### Images
To add images to a blog entry, first place them in `/src/blog`. You may add images of any size, but please make sure they are at least 800x600 for quality purposes. Once added, run `gulp` in the root of the repo. This will automatically resize any images added and put them in the proper place.

You may link to these images then. Example: `<img src="/img/blog/IMAGE-NAME.png">`

#### Embded Tweets
To add an embeded tweet, you just need to grab the embed code from the tweet, and then wrap the embed code in a div as follows:

```
	<div class="tweet-embed-con">
	  <!-- Twitter Embed code goes here -->
	</div>
```

Check out the blog entry `/content/blog/nats-lands-in-london.md` for a detailed example.


#### Content
For adding content to the blog entry, please follow the [style guidelines and conventions](#styleguide) below.

===

## <a name="development"></a>Local Development

You can either user docker image for your local development or install requirements following this documentation.

### Docker image for nats-site:

Clone your forked copy of the repository:
```
git clone git@github.com:<YOUR GIT USERNAME>/nats-site.git
```

Change to the directory:
```
cd nats-site/
```

Build docker nats-site image:
```
docker build -t="nats-site" .
```

Run docker nats-site container:
``` 
docker run -d --name "nats-site" -v $(pwd):/nats-site -p 1313:1313 nats-site
```

The container is starting with Hugo, Pygments, NodeJS, NPM and GraphicsMagic installed.

Build install Node dependencies and Gulp : 
```
docker exec -t nats-site npm install
docker exec -t nats-site npm install --global gulp-cli
```

Create a new blog post : 
```
docker exec -t nats-site hugo new blog/my-blog-post.md
```

Build web resources with Gulp:
```
docker exec -i nats-site gulp
```

As Hugo is started with live preview mode you can directly edit your forked repository and then go to http://127.0.0.1:1313 in order to check your changes.


### Local Install

#### Requirements

* A forked [nats-site](https://github.com/nats-io/nats-site) repository cloned locally.
* [HUGO](https://gohugo.io) installed.
* [Pygments](http://pygments.org/) installed for syntax highlighting. (**Used for code blocks in documentation and blog posts**)
* [npm + Node.js](https://docs.npmjs.com/getting-started/installing-node) installed.

#### Install HUGO:

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

Build the site and start the server:
```
hugo server -w
```

#### Install Pygments
We use [Pygments](http://pygments.org/) for syntax highlighting in the documentation and blog posts. For directions on installing it, please follow the guide on [HUGO's site](https://gohugo.io/extras/highlighting/#pygments).

#### Install npm + Node.js
Follow the instructions on [https://docs.npmjs.com/getting-started/installing-node](https://docs.npmjs.com/getting-started/installing-node) on installing Node.js and NPM

We use gulp to build the following items:

* All images
* CSS
* Javascript

**Note:** *In order to run `gulp` you will have to run `npm install` in the root of the project to install all dependencies if you have not done so yet. The `gulp-gm` dependency additionally requires that GraphicsMagick or ImageMagick be [installed on your system](https://github.com/scalableminds/gulp-gm).*





## <a name="notes"></a>Notes

### Checking your work

To make sure your changes render correctly, you can build and preview the site on your local system using Hugo.
One great thing about Hugo is that it has a live preview mode. In live preview mode, Hugo spawns a web server that detects content updates in the tree and will render Markdown to HTML in real time. This means you can see the updated content and layout in real time as you edit!


