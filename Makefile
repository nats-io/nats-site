setup:
	npm install
	brew install hugo

generate-client-pages:
	scripts/generate-client-pages.sh

generate-pgp-wkd:
	./pgp/update -v -d nats.io -k pgp/*.asc -o static

develop: generate-client-pages generate-pgp-wkd
	hugo server --buildDrafts --buildFuture

netlify-production-build: generate-client-pages generate-pgp-wkd
	hugo --minify

netlify-preview-build: generate-client-pages generate-pgp-wkd
	hugo --baseURL $(DEPLOY_PRIME_URL) --buildDrafts --buildFuture
