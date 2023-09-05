# Contentum [![NPM version](https://img.shields.io/npm/v/contentum.svg)](https://www.npmjs.com/package/contentum) ![NPM](https://img.shields.io/npm/l/contentum.svg)

> Inspired by [prerender](https://github.com/prerender/prerender)

## Motivation

Don't forget SEO when developing web applications.

At the moment, there are many libraries that allow you to achieve server rendering.
But they all require changes in the source code of your application, which is not always easy to do for large or old
projects.

Contentum allows server side rendering without a single change to the source code of your application.

All you need to configure Contentum is either a basic knowledge of configuring Nginx or some middleware on the server.

## Features

- Uses [Puppeteer](https://github.com/puppeteer/puppeteer) under the hood
- Supports any [Map Interface](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
  caching stores
- Highly configurable

## Installation

```sh
npm i contentum
```

## API

> each public API method returns a Promise

```js

/**
 * @param {string} url
 * @param {Object} options
 * @param {boolean} useCache
 * @returns {Promise<Content>}
 */
get(url = "", options = {}, useCache = true);

/**
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<Content>}
 */
getWithCache(url, options);

/**
 * @param {string} url
 * @param {Object} options
 * @returns {Promise<Content>}
 */
getWithoutCache(url, options);

/**
 * @param {string} url
 * @returns {Promise<Content>}
 */
forget(url);

```

## Example

```js

const contentum = new Contentum(
    1,       /* number of workers, required */
    'memory' /* type of cache */
);
await contentum.initPool();

// how to get content of url (basic method)
let {status, content} = await contentum.get('https://google.com');

// how to get content of url with cache
let {status, content} = await contentum.getWithCache('https://google.com');

// how to get content of url without cache
let {status, content} = await contentum.getWithoutCache('https://google.com');

// how to clear the cache for specific url
await contentum.forget('https://google.com');

// how to clear the entire cache
await contentum.forget('*');

```

### Instance methods

The available instance methods are listed below. The specified options will be merged with the default options.

##### contentum#get(url, [, options[, useCache]])

##### contentum#getWithCache(url[, options])

##### contentum#getWithoutCache(url[, options])

##### contentum#forget(url)

## Page content options

These are the available config options for page rendering.

```js
const options = {
  // `userAgent` is custom user-agent to be sent
  userAgent: null,

  // `headers` are custom headers to be sent
  // please use lowercase keys
  headers: {'x-custom-header': 'custom header value'},
    
  // `removeScripts` indicates whether or not SSSR will remove any scripts from page content after rendering
  removeScripts: true, // default

  // puppeteer specific option
  // `waitUntil` is the request method to be used when making the request
  // https://github.com/puppeteer/puppeteer/blob/v9.1.1/docs/api.md#pagegotourl-options
  waitUntil: 'load', // default

  // puppeteer specific option
  // `timeout` specifies the number of milliseconds before the request times out.
  // https://github.com/puppeteer/puppeteer/blob/v9.1.1/docs/api.md#pagesetdefaultnavigationtimeouttimeout
  timeout: 1000, // default is `30000` ms (30 seconds)
        
  // puppeteer specific option
  // `waitForSelector` is any selector on page for waiting. Default is "body"
  // https://github.com/puppeteer/puppeteer/blob/v9.1.1/docs/api.md#pagewaitforselectorselector-options
  waitForSelector: "body"
}
```

### License

**contentum** is open-sourced software licensed under the [MIT license](./LICENSE.md).

[Vano Devium](https://github.com/vanodevium/)

---

Made with ❤️ in Ukraine
