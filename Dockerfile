FROM node:18-alpine3.18 as builder

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:18-alpine3.18

ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROME_PATH=/usr/lib/chromium/

RUN apk add --update-cache chromium=115.0.5790.170-r0
RUN rm -rf /var/cache/apk/* /tmp/*

WORKDIR /app

COPY --from=builder /app /app
COPY . /app

CMD ["node", "init.js"]
