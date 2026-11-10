HUGO_VERSION := $(shell sed -n 's/^HUGO_VERSION = "\(.*\)"/\1/p' netlify.toml)

setup:
	brew install hugo sass/sass/sass

develop:
	hugo server --buildDrafts --buildFuture

docker:
	docker run --rm -it -p 1313:1313 -v "$(CURDIR)":/project \
		--user $$(id -u):$$(id -g) -e HOME=/tmp -e HUGO_CACHEDIR=/tmp/hugo_cache \
		ghcr.io/gohugoio/hugo:v$(HUGO_VERSION) \
		server --bind 0.0.0.0 --buildDrafts --buildFuture

# Netlify's build image has no Dart Sass; install the version pinned in netlify.toml.
netlify-dart-sass:
	mkdir -p $(HOME)/.local
	curl -sfL https://github.com/sass/dart-sass/releases/download/$(DART_SASS_VERSION)/dart-sass-$(DART_SASS_VERSION)-linux-x64.tar.gz | tar -xz -C $(HOME)/.local

netlify-production-build: netlify-dart-sass
	PATH="$(HOME)/.local/dart-sass:$$PATH" hugo --minify

netlify-preview-build: netlify-dart-sass
	PATH="$(HOME)/.local/dart-sass:$$PATH" hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture
