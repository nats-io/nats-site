FROM node:current-alpine

RUN apk add --update hugo

VOLUME /nats-site
WORKDIR /nats-site

COPY package.json /nats-site/package.json
COPY package-lock.json /nats-site/package-lock.json
COPY yarn.lock /nats-site/yarn.lock
RUN npm install

EXPOSE 1313
ENTRYPOINT [""]
CMD ["/usr/bin/hugo", "server", "-D", "-w", "--bind", "0.0.0.0"]
