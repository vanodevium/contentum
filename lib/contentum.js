const debug = require("debug")("contentum:engine");
const Pool = require("./pool");
const { cacheFactory, EnvironmentCache, default: Cache } = require("./cache");
const Content = require("./content");
const removeScripts = require("./utils/remove-scripts");
const { getInstance } = require("./browser");

/**
 * @typedef WaitUntilOption
 * @type {"load"|"domcontentloaded"|"networkidle0"|"networkidle2"|string[]}
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
 * @type {PageOptions}
 */
const DefaultPageOptions = {
  userAgent: null,
  headers: {},
  waitUntil: "load",
  timeout: 30000,
  waitForSelector: "body",
  removeScripts: true,
};

class Contentum {
  MARKER = "_contentum_";

  /**
   * @param {number} [workers=1]
   * @param {false|Cache|Object|string} [cacheOption]
   */
  constructor(workers = 1, cacheOption = null) {
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
   * @returns {Promise<Pool>}
   */
  async initPool() {
    await this._initBrowser();

    this.pool = await Pool.init(this.workers);

    return this.pool;
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @param {boolean} useCache
   * @returns {Promise<Content>}
   */
  async get(url = "", options = {}, useCache = true) {
    options = Object.assign({}, DefaultPageOptions, options);

    url = this.normalizeUrl(url);

    if (!url) {
      return new Content(400, "", "Invalid URL");
    }

    let content;

    try {
      if (useCache) {
        content = await this.cache.get(url);
      }

      if (content) {
        return new Content(200, content);
      }

      content = (await this.pool.process(this.makePageOptions(url, options)))
        .content;

      if (options.removeScripts) {
        content = removeScripts(content);
      }

      if (content && useCache) {
        await this.cache.set(url, content);
      }

      return new Content(200, content);
    } catch (e) {
      debug(`error during rendering ${url}: ${e.message}`);

      return new Content(e.code || 400, "", e.message);
    }
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Content>}
   */
  async getWithCache(url, options) {
    return this.get(url, options, true);
  }

  /**
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<Content>}
   */
  async getWithoutCache(url, options) {
    return this.get(url, options, false);
  }

  /**
   * @param {string} url
   * @returns {Promise<Content>}
   */
  async forget(url) {
    if ("*" === url) {
      await this.cache.clear();
    } else {
      await this.cache.delete(this.normalizeUrl(url));
    }

    return new Content(202);
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
      const url = new URL(urlString);

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
    url.searchParams.append(this.MARKER, "true");
  }

  /**
   * @returns {Promise<void>}
   */
  async _initBrowser() {
    const browserLauncher = await getInstance();
    await browserLauncher.launchBrowser();
  }

  /**
   * @returns {Promise<*>}
   */
  async terminate() {
    return this.pool._pool.terminate(true).then(() => process.exit());
  }
}

module.exports = Contentum;
module.exports.DefaultPageOptions = DefaultPageOptions;
