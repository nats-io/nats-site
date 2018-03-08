CURRENT_DIR=$(pwd)
.DEFAULT_GOAL=build

setup:
	npm install
	npm install --global gulp-cli
	brew install hugo
	brew install imagemagick
	brew install graphicsmagick
	npm install gm

build:
	gulp build

minify:
	minify --html-keep-conditional-comments --html-keep-document-tags --html-keep-end-tags -r -o public/ -a public/

clean:
	gulp clean

deploy:
	cd public; s3cmd sync . s3://test.nats.io/