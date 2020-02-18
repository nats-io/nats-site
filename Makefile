setup:
	npm install
	brew install hugo

generate-client-pages:
	scripts/generate-client-pages.sh

develop: generate-client-pages
	hugo server --buildDrafts --buildFuture

netlify-production-build:
	hugo --minify

netlify-preview-build: assets
	hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture
