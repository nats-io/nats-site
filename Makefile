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

clean:
	gulp clean

deploy:
	cd public; s3cmd sync . s3://test.nats.io/