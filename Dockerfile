FROM node:lts-alpine as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=prod

FROM node:lts-alpine

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

RUN apk add --update-cache chromium=111.0.5563.146-r0
RUN rm -rf /var/cache/apk/* /tmp/*

WORKDIR /app

COPY --from=builder /app /app
COPY . /app

CMD ["node", "init.js"]
