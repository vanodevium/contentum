FROM node:18-alpine3.18 as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:18-alpine3.18

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

RUN apk add --update-cache chromium
RUN rm -rf /var/cache/apk/* /tmp/*

WORKDIR /app

COPY --from=builder /app /app
COPY . /app

CMD ["npx", "-y", "nodemon", "init.mjs"]
