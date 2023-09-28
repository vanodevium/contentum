import { default as Debug } from "debug";
const debug = Debug("contentum:browser");

import { launch, connect, Browser } from "puppeteer";

class BrowserLauncher {
  constructor() {
    /**
     * @type {Browser|null}
     */
    this.browser = null;
  }

  async launchBrowser() {
    if (process.env.NODE_ENV === "testing") {
      return Promise.resolve();
    }

    if (this.browser) {
      return this.browser;
    }

    this.browser = await launch({
      headless: "new",
      debuggingPort: 9222,
      handleSIGINT: true,
      handleSIGHUP: true,
      handleSIGTERM: true,
      waitForInitialPage: false,
      args: [
        "--no-sandbox",
        "--no-startup-window",
        "--disable-gpu",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--hide-scrollbars",
        "--allow-insecure-localhost",
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
   * @returns {Promise<Browser>}
   */
  async connect() {
    this.browser = await connect({
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

export default BrowserSingleton;
