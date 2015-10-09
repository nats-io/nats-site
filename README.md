# NATS documentation

NATS documentation is a work in progress. This repository will be open sourced at nats-io once a baseline set of content is created.

- NATS Concepts
- NATS Server
- NATS Clients
- NATS Internals
- NATS Tutorials

## Adding documentation

Each page added needs a header like the following:

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

## Local Development

Install HUGO:
```
go get -u -v github.com/spf13/hugo
```

Clone repository:
```
git clone git@github.com:nats-io/nats-docs.git
```

Change to the directory:
```
cd nats-docs/
```

Get NATS theme:
```
git submodule init
```

Next you need to pull in the theme submodule.

For the first time:
```
git submodule update
```
Or, to update to the latest if it has changed since first pulling it in:
```
git submodule foreach git pull origin master
```

Build the site and start the server:
```
cd site/
hugo server -w --port=1414 --theme=nats --buildDrafts
```

## Deploy
Will build the site without live reload and make ready for production.
```
hugo --theme=nats --buildDrafts
```

## Style guidelines and conventions for documentation

- Use topic-based files and titling
- Use only headers 1 (#), 2 (##) and 3 (###)
- Markdown syntax: http://daringfireball.net/projects/markdown/syntax#img
	- Links: `[NATS](http://nats.io/)`
	- Cross references: `[client libraries](/documentation/clients/nats-clients/)`
	- Images: `![drawing](/documentation/img/nats-msg.png)`
- Triple ticks for code, commands to run, user operations, input/output
- Single ticks for executable names, file paths, inline commands, parameters, etc.
- Graphics: save as *.png; source in /content/documentation/img/nats-img-src.graffle

## Contributing content

1) Clone the repo: `git clone git@github.com:nats-io/nats-docs.git`.

2) CD to nats-docs directory.

3) Update local repo with latest changes: `git pull origin master`.

4) Create local branch: `git checkout -b <local-branch-name>` .

5) Make your changes/additions to using markdown.

6) Run `git status` to see the changes.

7) Run `git add .` to add the files to the commit.

8) Commit the changes: `git commit -a -m “my commit message”`.

9) Push changes to github: `git push -u origin <local-branch-name>`.

9) Go to GitHub.com, do a PR, and tag (`@`) people to review.
