const debug = require("debug")("contentum:worker");
const filterHeaders = require("./utils/filter-headers");
const uselessTypes = require("./interceptors/useless-types");
const uselessResources = require("./interceptors/useless-resources");
const ContentError = require("./error");

const { getInstance } = require("./browser");

class Worker {
  /**
   * @param {Object} pageOptions
   * @returns {Promise<*>}
   */
  async process(pageOptions) {
    if (!this.browser) {
      try {
        this.browser = await (await getInstance()).connect();
      } catch (_) {
        return Promise.reject(
          new ContentError("Browser connection problem", 425),
        );
      }
    }

    const browser = this.browser;

    let content = "";

    let page = null;

    return new Promise(async (resolve, reject) => {
      page = await browser.newPage();

      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (uselessTypes(request) || uselessResources(request)) {
          return request.abort();
        }

        request.continue();
      });

      try {
        debug(`processing ${pageOptions.url}`);

        await this.processPage(page, pageOptions);

        debug(`processed ${pageOptions.url}`);

        content = await page.content();
      } catch (e) {
        debug(e.message);

        return reject(e);
      }

      return resolve(content);
    })
      .catch((e) => {
        debug(e.message);

        return Promise.reject(e);
      })
      .finally(async () => {
        await page?.close();
      });
  }

  /**
   * @param {Object} page
   * @param {Object} pageOptions
   * @returns {Promise<void>}
   */
  async processPage(page, pageOptions) {
    await this.setUserAgent(page, pageOptions.options);
    await this.setHeaders(page, filterHeaders(pageOptions.options.headers));
    await this.goto(page, pageOptions.goto, pageOptions.options);
    await this.waitForSelector(page, pageOptions.options);
  }

  /**
   * @param {Object} page
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async setUserAgent(page, options) {
    const userAgent = options.userAgent || options.headers["user-agent"];

    if (!userAgent) {
      return;
    }

    return page.setUserAgent(userAgent);
  }

  /**
   * @param {Object} page
   * @param {Object} headers
   * @returns {Promise<void>}
   */
  async setHeaders(page, headers) {
    return page.setExtraHTTPHeaders(headers);
  }

  /**
   * @param {Object} page
   * @param {string} url
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async goto(page, url, options) {
    return page.goto(url, {
      waitUntil: options.waitUntil,
      timeout: options.timeout,
    });
  }

  /**
   * @param {Object} page
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async waitForSelector(page, options) {
    const selector = options.waitForSelector;

    return page.waitForSelector(selector, {
      timeout: options.timeout,
    });
  }
}

module.exports = Worker;
