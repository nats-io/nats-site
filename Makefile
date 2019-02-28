NODE_BIN = node_modules/.bin
GULP = $(NODE_BIN)/gulp

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

minify:
	minify --html-keep-conditional-comments --html-keep-document-tags --html-keep-end-tags -r -o public/ -a public/

clean:
	$(GULP) clean

deploy:
	cd public; s3cmd sync . s3://test.nats.io/
#	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://test.nats.io/img
#	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://test.nats.io/font

prod:
	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://www.nats.io/img
	s3cmd --recursive modify --add-header="Cache-Control:public, max-age=31536000, stale-while-revalidate=86400, stale-if-error=86400" s3://www.nats.io/font