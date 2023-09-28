if (process.env.NODE_ENV !== "testing") {
  await import("dotenv/config");
}

import { default as Debug } from "debug";
const debug = Debug("contentum:engine");

import Pool from "./pool.mjs";
import { cacheFactory, EnvironmentCache } from "./cache.mjs";
import removeScripts from "./utils/remove-scripts.mjs";
import normalizeUrl from "./utils/normalize-url.mjs";
import Browser from "./browser.mjs";

/**
 * @typedef WaitUntilOption
 * @type {"load"|"domcontentloaded"|"networkidle0"|"networkidle2"|string[]}
 */

/**
 * @typedef ContentumOptions
 * @type {Object}
 * @property {?string} upstream
 * @property {number} workers
 */

/**
 * @typedef PageOptions
 * @type {Object}
 * @property {?string} userAgent
 * @property {Object.<string, string>} headers
 * @property {WaitUntilOption} waitUntil
 * @property {number} timeout
 * @property {string} waitForSelector
 * @property {boolean} removeScripts
 */

/**
 * @type {ContentumOptions}
 */
const DefaultContentumOptions = {
  upstream: null,
  workers: 1,
};

/**
 * @type {PageOptions}
 */
export const DefaultPageOptions = {
  userAgent: null,
  headers: {},
  waitUntil: "load",
  timeout: 30000,
  waitForSelector: "body",
  removeScripts: false,
};

class Contentum {
  MARKER = "_contentum_";

  /**
   * @param {number} [workers=1]
   * @param {false|Cache|Object|string} [cacheOption]
   * @param {ContentumOptions|Object} [options]
   */
  constructor(workers = 1, cacheOption = null, options = {}) {
    options = Object.assign({}, DefaultContentumOptions, options);

    this.upstream = options.upstream || process.env.UPSTREAM || "";

    this.workers = workers;

    if (cacheOption && typeof cacheOption === "object") {
      this.cache = cacheOption;
    } else if (
      typeof cacheOption === "boolean" ||
      typeof cacheOption === "string"
    ) {
      this.cache = cacheFactory(cacheOption);
    } else {
      this.cache = EnvironmentCache();
    }

    this.initSignals();
  }

  /**
   * @returns {Promise<Pool>}
   */
  async initPool() {
    if (process.env.NODE_ENV !== "testing") {
      await this._initBrowser();
    }

    this.pool = await Pool.init(this.workers);

    return this.pool;
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @param {boolean} useCache
   * @returns {Promise<Response>}
   */
  async get(url = "", options = {}, useCache = true) {
    options = Object.assign({}, DefaultPageOptions, options);

    url = this.normalizeUrl(url);

    if (!url) {
      return new Response("Invalid URL", {
        status: 400,
      });
    }

    let contentResponse;

    try {
      if (useCache) {
        contentResponse = await this.cache.get(url);
      }

      if (contentResponse) {
        return new Response(contentResponse.body, contentResponse);
      }

      try {
        const fetchResponse = await fetch(url, { method: "HEAD" });
        if (fetchResponse.ok) {
          const contentType = fetchResponse.headers.get("content-type");
          if (contentType && !contentType.includes("html")) {
            return this.fetchURL(url);
          }
        } else {
          return new Response(null, { status: fetchResponse.status });
        }
      } catch (e) {
        return new Response(null, { status: 404 });
      }

      contentResponse = await this.pool.process(
        this.makePageOptions(url, options),
      );
      if (contentResponse.body) {
        if (options.removeScripts) {
          contentResponse.body = removeScripts(contentResponse.body);
        }

        if (useCache) {
          await this.cache.set(url, contentResponse);
        }
      }

      return new Response(contentResponse.body, contentResponse);
    } catch (e) {
      debug(`error during rendering ${url}: ${e.message}`);

      return new Response(e.message, {
        status: e.code || 400,
      });
    }
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Response>}
   */
  async getWithCache(url, options) {
    return this.get(url, options, true);
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Response>}
   */
  async getWithoutCache(url, options) {
    return this.get(url, options, false);
  }

  /**
   * @param {string} url
   * @returns {Promise<Response>}
   */
  async forget(url) {
    if ("*" === url) {
      await this.cache.clear();
    } else {
      await this.cache.delete(this.normalizeUrl(url));
    }

    return new Response("", {
      status: 202,
    });
  }

  /**
   * @param {string} url
   * @param {PageOptions|Object} options
   * @returns {Object}
   */
  makePageOptions(url, options) {
    options = Object.assign({}, options);

    return {
      url,
      options,
      goto: this.normalizeUrl(url, true),
    };
  }

  /**
   * @param {string} urlString
   * @param {boolean} setIdentifier
   * @returns {string}
   */
  normalizeUrl(urlString, setIdentifier = false) {
    try {
      if (!urlString.startsWith("http")) {
        if (this.upstream) {
          let upstream = this.upstream;
          if (upstream.endsWith("/")) {
            upstream = upstream.slice(0, -1);
          }
          if (urlString.startsWith("/")) {
            urlString = urlString.slice(1);
          }

          urlString = `${upstream}/${urlString}`;
        } else {
          return "";
        }
      }

      const url = new URL(
        normalizeUrl(urlString, {
          normalizeProtocol: true,
        }),
      );

      if (setIdentifier) {
        this.setQueryMarker(url);
      }

      return url.toString();
    } catch (_) {
      return "";
    }
  }

  /**
   * @param {URL} url
   */
  setQueryMarker(url) {
    url.searchParams.delete(this.MARKER);
    url.searchParams.append(this.MARKER, "1");
  }

  /**
   * @returns {Promise<void>}
   */
  async _initBrowser() {
    const browserLauncher = await Browser.getInstance();
    await browserLauncher.launchBrowser();
  }

  /**
   * @returns {Promise<*>}
   */
  async terminate() {
    return this.pool._pool.terminate(true).then(() => process.exit());
  }

  initSignals() {
    process.on(
      "SIGINT",
      function () {
        return this.terminate();
      }.bind(this),
    );
    process.on(
      "SIGTERM",
      function () {
        return this.terminate();
      }.bind(this),
    );
  }

  /**
   * @param {String} url
   * @returns {Promise<Response>}
   */
  async fetchURL(url = "") {
    const res = await fetch(url);
    return new Response(res.body, res);
  }
}

export default Contentum;
