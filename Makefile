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
