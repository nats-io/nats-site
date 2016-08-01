FROM alpine:latest
MAINTAINER Mathilde Ffrench <mathilde.ffrench@echinopsii.net>

ENV LANG=C.UTF-8 PYTHON_VERSION=2.7.12 PYTHON_PIP_VERSION=8.1.2 HUGO_VERSION=0.16 NODE_VERSION=v6.3.1 NPM_VERSION=3 NODE_CONFIG_FLAGS="--fully-static" NODE_DEL_PKGS="libgcc libstdc++" NODE_RM_DIRS=/usr/include GRMK_PKGNAME=graphicsmagick GRMK_PKGVER=1.3.23 
ENV GRMK_PKGSOURCE=http://downloads.sourceforge.net/$GRMK_PKGNAME/$GRMK_PKGNAME/$GRMK_PKGVER/GraphicsMagick-$GRMK_PKGVER.tar.lz

# nats-site dev env - one shoot installer : Python, Hugo, Pygments, GraphicsMagick and Node
RUN set -ex \
  && apk add --update wget ca-certificates \ 
  && apk add --no-cache --virtual .fetch-deps curl gnupg tar xz \
  && apk add --no-cache --virtual .build-deps  \
    bzip2-dev \
    gcc \
    libc-dev \
    linux-headers \
    make \
    ncurses-dev \
    openssl-dev \
    pax-utils \
    readline-dev \
    sqlite-dev \
    tcl-dev \
    tk-dev \
    zlib-dev \
  && apk add --update g++ \
                     gcc \
                     make \
                     lzip \
                     wget \
                     libjpeg-turbo-dev \
                     libpng-dev \
                     libtool \
                     libgomp \
  && apk add --no-cache curl make gcc g++ linux-headers paxctl libgcc libstdc++ gnupg \

  && curl -fSL "https://www.python.org/ftp/python/${PYTHON_VERSION%%[a-z]*}/Python-$PYTHON_VERSION.tar.xz" -o python.tar.xz \
  && curl -fSL "https://www.python.org/ftp/python/${PYTHON_VERSION%%[a-z]*}/Python-$PYTHON_VERSION.tar.xz.asc" -o python.tar.xz.asc \
  && export GNUPGHOME="$(mktemp -d)" \
  && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys \
  C01E1CAD5EA2C4F0B8E3571504C367C218ADD4FF \ 
  9554F04D7259F04124DE6B476D5A82AC7E37093B \
  94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
  0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \ 
  FD3A5288F042B6850C66B31F09FE44734EB7990E \
  71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \ 
  DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  B9AE9905FFD7803F25714661B63B535A4C206CA9 \
  && gpg --batch --verify python.tar.xz.asc python.tar.xz \
  && rm -r "$GNUPGHOME" python.tar.xz.asc \

  && mkdir -p /usr/src/python \
  && tar -xJC /usr/src/python --strip-components=1 -f python.tar.xz \
  && rm python.tar.xz \
  && cd /usr/src/python \
  && ./configure \
    --enable-shared \
    --enable-unicode=ucs4 \
  && make -j$(getconf _NPROCESSORS_ONLN) \
  && make install \
 
  && curl -fSL 'https://bootstrap.pypa.io/get-pip.py' | python2 \
  && pip install --no-cache-dir --upgrade pip==$PYTHON_PIP_VERSION \
  && [ "$(pip list | awk -F '[ ()]+' '$1 == "pip" { print $2; exit }')" = "$PYTHON_PIP_VERSION" ] \
  && find /usr/local -depth \
    \( \
      \( -type d -a -name test -o -name tests \) \
      -o \
      \( -type f -a -name '*.pyc' -o -name '*.pyo' \) \
    \) -exec rm -rf '{}' + \
  && runDeps="$( \
    scanelf --needed --nobanner --recursive /usr/local \
      | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
      | sort -u \
      | xargs -r apk info --installed \
      | sort -u \
  )" \
  && apk add --virtual .python-rundeps $runDeps \
 
  && cd /tmp/ \
  && wget --no-check-certificate https://github.com/spf13/hugo/releases/download/v${HUGO_VERSION}/hugo_${HUGO_VERSION}_linux-64bit.tgz \
  && tar xzf hugo_${HUGO_VERSION}_linux-64bit.tgz \
  && rm -r hugo_${HUGO_VERSION}_linux-64bit.tgz \
  && mv hugo /usr/bin/hugo \
  
  && cd / \
  && pip install Pygments \
  
  && wget $GRMK_PKGSOURCE \
  && lzip -d -c GraphicsMagick-$GRMK_PKGVER.tar.lz | tar -xvf - \
  && cd GraphicsMagick-$GRMK_PKGVER \
  && ./configure \
    --build=$CBUILD \
    --host=$CHOST \
    --prefix=/usr \
    --sysconfdir=/etc \
    --mandir=/usr/share/man \
    --infodir=/usr/share/info \
    --localstatedir=/var \
    --enable-shared \
    --disable-static \
    --with-modules \
    --with-threads \
    --with-gs-font-dir=/usr/share/fonts/Type1 \
    --with-quantum-depth=16 \
  && make \
  && make install \
  && cd .. \
  && rm -rf GraphicsMagick-$GRMK_PKGVER \
  && rm GraphicsMagick-$GRMK_PKGVER.tar.lz \

  && curl -o node-${NODE_VERSION}.tar.gz -sSL https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}.tar.gz \
  && curl -o SHASUMS256.txt.asc -sSL https://nodejs.org/dist/${NODE_VERSION}/SHASUMS256.txt.asc \
  && export GNUPGHOME="$(mktemp -d)" \
  && gpg --keyserver ha.pool.sks-keyservers.net --recv-keys \
  C01E1CAD5EA2C4F0B8E3571504C367C218ADD4FF \
  9554F04D7259F04124DE6B476D5A82AC7E37093B \
  94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
  0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
  FD3A5288F042B6850C66B31F09FE44734EB7990E \
  71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
  DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
  C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  B9AE9905FFD7803F25714661B63B535A4C206CA9 \
  && gpg --verify SHASUMS256.txt.asc \
  && grep node-${NODE_VERSION}.tar.gz SHASUMS256.txt.asc | sha256sum -c - \
  && tar -zxf node-${NODE_VERSION}.tar.gz \
  && cd node-${NODE_VERSION} \
  && export GYP_DEFINES="linux_use_gold_flags=0" \
  && ./configure --prefix=/usr ${NODE_CONFIG_FLAGS} \
  && NPROC=$(grep -c ^processor /proc/cpuinfo 2>/dev/null || 1) \
  && make -j${NPROC} -C out mksnapshot BUILDTYPE=Release \
  && paxctl -cm out/Release/mksnapshot \
  && make -j${NPROC} \
  && make install \
  && paxctl -cm /usr/bin/node \
  && cd / \
  && if [ -x /usr/bin/npm ]; then \
    npm install -g npm@${NPM_VERSION} && \
    find /usr/lib/node_modules/npm -name test -o -name .bin -type d | xargs rm -rf; \
  fi \  
  && apk del curl make gcc g++ python linux-headers paxctl gnupg ${NODE_DEL_PKGS} \
  && rm -rf /etc/ssl /node-${VERSION}.tar.gz /SHASUMS256.txt.asc /node-${NODE_VERSION} ${NODE_RM_DIRS} \
    /usr/share/man /tmp/* /var/cache/apk/* /root/.npm /root/.node-gyp /root/.gnupg \
    /usr/lib/node_modules/npm/man /usr/lib/node_modules/npm/doc /usr/lib/node_modules/npm/html \
  && apk del wget ca-certificates


VOLUME /nats-site

WORKDIR /nats-site

EXPOSE 1313

CMD ["/usr/bin/hugo", "server", "-w", "--bind", "0.0.0.0"]
