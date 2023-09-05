const debug = require("debug")("contentum:browser");
const puppeteer = require("puppeteer");

class BrowserLauncher {
  constructor() {
    /**
     * @type {puppeteer.Browser|null}
     */
    this.browser = null;
  }

  async launchBrowser() {
    if (process.env.JEST_WORKER_ID) {
      return Promise.resolve();
    }

    if (this.browser) {
      return this.browser;
    }

    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        "--headless",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--allow-insecure-localhost",
        "--remote-debugging-port=9222",
      ],
      ignoreHTTPSErrors: true,
      executablePath: process.env.CHROME_BIN || null,
    });

    debug({
      version: await this.browser.version(),
      pid: this.browser.process().pid,
    });

    return this.browser;
  }

  /**
   * @returns {Promise<puppeteer.Browser>}
   */
  async connect() {
    this.browser = await puppeteer.connect({
      browserURL: "http://127.0.0.1:9222",
    });

    debug({
      version: await this.browser.version(),
    });

    return this.browser;
  }
}

class BrowserSingleton {
  constructor() {
    throw new Error("Use Singleton.getInstance()");
  }

  /**
   * @returns {Promise<BrowserLauncher>}
   */
  static async getInstance() {
    if (!BrowserSingleton.instance) {
      BrowserSingleton.instance = new BrowserLauncher();
    }
    return BrowserSingleton.instance;
  }
}

module.exports = BrowserSingleton;
