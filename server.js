const Koa = require("koa");
const Router = require("@koa/router");
const compress = require("koa-compress");
const Contentum = require("./index");

const NO_CACHE_HEADER = "x-contentum-no";
const REQUEST_PATTERN = "/:url(.*)";

/**
 * @param {Number} workers
 * @param {Boolean|String} cache
 * @returns {Application}
 */
function init(workers = 1, cache = null) {
  const app = new Koa();
  const router = new Router();

  const contentum = new Contentum(workers, cache);
  contentum.initPool();

  router.get(REQUEST_PATTERN, async (ctx) => {
    const options = {
      headers: ctx.headers,
    };
    const useCache = !Object.hasOwn(ctx.request.headers, NO_CACHE_HEADER);
    const { status, content } = await contentum.get(parseUrlString(ctx), options, useCache);
    ctx.status = status;
    ctx.body = content;
    ctx.set('x-contentum', 'yes');
  });

  router.del(REQUEST_PATTERN, async (ctx) => {
    const { status } = await contentum.forget(parseUrlString(ctx));
    ctx.status = status;
  });

  app.use(compress());
  app.use(router.routes());
  app.use(router.allowedMethods());

  return app;
}

/**
 * @param {Object} ctx
 * @returns {string}
 */
function parseUrlString(ctx) {
  let urlString = ctx.params.url;
  if (ctx.querystring) {
    urlString += `?${ctx.querystring}`;
  }
  return urlString;
}

module.exports = init;
