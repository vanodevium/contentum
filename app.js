const Koa = require("koa");
const Router = require("@koa/router");
const compress = require("koa-compress");
const SSSR = require("./index");

const NO_CACHE_HEADER = "x-sssr-no-cache";
const REQUEST_PATTERN = "/:url(.*)";

/**
 * @param {Number} workers
 * @returns {Application}
 */
function init(workers = 1) {
  const app = new Koa();
  const router = new Router();

  const sssr = new SSSR(workers);

  router.get(REQUEST_PATTERN, async (ctx) => {
    const options = {
      headers: ctx.headers,
    };
    const useCache = !Number(ctx.get(NO_CACHE_HEADER));
    const { status, content } = await sssr.get(parseUrlString(ctx), options, useCache);
    ctx.status = status;
    ctx.body = content;
  });

  router.del(REQUEST_PATTERN, async (ctx) => {
    const { status } = await sssr.forget(parseUrlString(ctx));
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
