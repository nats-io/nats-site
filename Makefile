setup:
	npm install
	brew install hugo

generate-client-pages:
	scripts/generate-client-pages.sh

develop: generate-client-pages
	hugo server --buildDrafts --buildFuture

netlify-production-build: generate-client-pages
	hugo --minify

netlify-preview-build: generate-client-pages
	hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture

docker:
	@echo "\033[0;32m Building and running NATS Website ... \033[0m"
	docker build -t nats-site .
	docker run --rm -p 1313:1313 -v ${PWD}:/nats-site nats-site
