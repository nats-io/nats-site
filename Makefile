NODE_BIN = node_modules/.bin
GULP = $(NODE_BIN)/gulp
CONCURRENTLY = $(NODE_BIN)/concurrently

CURRENT_DIR=$(pwd)
.DEFAULT_GOAL=build

setup:
	npm install
	brew install hugo
	brew install imagemagick
	brew install graphicsmagick
	npm install gm

build:
	$(GULP) build

clean:
	$(GULP) clean

deploy:
	cd public; s3cmd sync . s3://test.nats.io/
#	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://test.nats.io/img
#	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://test.nats.io/font

prod:
	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://www.nats.io/img
	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://www.nats.io/font

# Commands related to running the site locally

develop-assets:
	$(GULP) watch

develop-site:
	hugo server --buildDrafts --buildFuture

develop:
	$(CONCURRENTLY) "make develop-assets" "make develop-site"

# Commands related to the Netlify build

assets:
	$(GULP) assets

netlify-production-build: assets
	hugo

netlify-preview-build: assets
	hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture
