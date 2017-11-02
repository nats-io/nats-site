CURRENT_DIR=$(pwd)

setup:
	npm install
	npm install --global gulp-cli
	npm install gulp-plumber --save-dev
	brew install hugo
	brew install imagemagick
	brew install graphicsmagick
	npm install gm

build:
	gulp build

upload:
	aws s3 rm --recursive s3://nats.io/
	aws s3 sync public s3://nats.io/

