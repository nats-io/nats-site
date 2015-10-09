# Nats.io


## Local Development
Install HUGO:
```
go get -u -v github.com/spf13/hugo
```

Clone repository
```
git clone git@github.com:nats-io/nats-site.git
```

Change to the directory
```
cd nats-site/
```

Get NATS theme
```
git submodule init
```

Next you need to pull in the theme submodule:
`git submodule update` for the first time, or `git submodule foreach git pull origin master` for updating it to the latest if it's changed since first pulling it in.

Build the site and start the server:
```
hugo server -w --port=1515 --theme=nats --buildDrafts
```

## Deploy

Will build the site without live reload and make ready for production.
```
hugo --theme=nats --buildDrafts
```
