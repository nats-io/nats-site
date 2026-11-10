HUGO_VERSION := $(shell sed -n 's/^HUGO_VERSION = "\(.*\)"/\1/p' netlify.toml)

setup:
	npm install
	brew install hugo

develop:
	hugo server --buildDrafts --buildFuture

docker:
	docker run --rm -it -p 1313:1313 -v "$(CURDIR)":/project \
		--user $$(id -u):$$(id -g) -e HOME=/tmp -e HUGO_CACHEDIR=/tmp/hugo_cache \
		ghcr.io/gohugoio/hugo:v$(HUGO_VERSION) \
		server --bind 0.0.0.0 --buildDrafts --buildFuture

netlify-production-build:
	hugo --minify

netlify-preview-build:
	hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture
