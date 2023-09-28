import { Hono } from "hono";
import Contentum from "./lib/contentum.mjs";

const NO_CACHE_HEADER = "x-no-contentum";
const ROUTER_PATTERN = "/:url{.*}?";

/**
 * @param {Number} workers
 * @param {Boolean|String} cache
 * @returns {Hono}
 */
function init(workers = 1, cache = null) {
  const app = new Hono();
  const contentum = new Contentum(workers, cache);
  contentum.initPool();

  app.get(ROUTER_PATTERN, async (ctx) => {
    const options = {
      headers: ctx.req.header(),
    };

    const parsedURL = parseUrlString(ctx);

    const useCache = !Object.hasOwn(ctx.req.header(), NO_CACHE_HEADER);
    return contentum.get(parsedURL, options, useCache);
  });

  app.delete(ROUTER_PATTERN, async (ctx) => {
    await contentum.forget(parseUrlString(ctx));
    ctx.status(202);
    return ctx.html("");
  });

  return app;
}

/**
 * @param {Object} ctx
 * @returns {string}
 */
function parseUrlString(ctx) {
  let urlString = ctx.req.param("url");
  let uri = new URL(ctx.req.url);
  if (uri.search) {
    urlString += uri.search;
  }
  return urlString;
}

export default init;
