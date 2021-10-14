const debug = require("debug")("sssr:worker");
const puppeteer = require("puppeteer");
const filterHeaders = require("./utils/filter-headers");
const uselessTypes = require("./interceptors/useless-types");
const uselessResources = require("./interceptors/useless-resources");

class Worker {
  /**
   * @returns {Promise<Worker>}
   */
  static initWorker() {
    return new Worker().init();
  }

  /**
   * @returns {Promise<Worker>}
   */
  async init() {
    this.browser = await this.initBrowser();

    debug({
      version: await this.browser.version(),
      pid: this.browser.process().pid,
    });

    return this;
  }

  /**
   * @param {Object} pageOptions
   * @returns {Promise<*>}
   */
  async process(pageOptions) {
    let content = "";

    let page = null;

    return new Promise(async (resolve, reject) => {
      page = await this.browser.newPage();

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
        return reject(e);
      }

      return resolve(content);
    })
      .catch((e) => {
        debug(e.message);

        return Promise.reject(e.message);
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

  /**
   * @returns {Promise<Browser>}
   */
  async initBrowser() {
    if (process.env.JEST_WORKER_ID) {
      return Promise.resolve();
    }

    return puppeteer.launch({
      headless: false,
      args: [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-insecure-localhost",
      ],
      ignoreHTTPSErrors: true,
      executablePath: process.env.CHROME_BIN || null,
    });
  }
}

module.exports = Worker;
