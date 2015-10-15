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

Get the NATS HUGO theme

If you you want to modify the NATS theme, fork the [NATS theme](https://github.com/nats-io/nats-theme), then `git clone` your forked repository.
```
git clone git@github.com:YOUR-USERNAME/nats-theme.git themes/nats
```
If you just want the theme for presentation while you make changes, you can just clone the [NATS theme](https://github.com/nats-io/nats-theme) directly.
```
git clone git@github.com:nats-io/nats-theme.git  themes/nats
```

Build the site and start the server:
```
hugo server -w --port=1515 --theme=nats --buildDrafts
```

## Deploy

Will build the site without live reload and make ready for production.
```
hugo --theme=nats --buildDrafts
```
