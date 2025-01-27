setup:
	npm install
	brew install hugo

develop:
	hugo server --buildDrafts --buildFuture

netlify-production-build:
	hugo --minify

netlify-preview-build:
	hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture
