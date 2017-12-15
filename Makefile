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

clean:
	gulp clean

deploy:
	aws s3 rm --recursive s3://www.nats.io/
	aws s3 sync public s3://www.nats.io/

