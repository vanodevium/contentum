import { default as Debug } from "debug";
const debug = Debug("contentum:cache");

import { EventEmitter } from "events";
EventEmitter.defaultMaxListeners = 0;

import KeyValue from "keyv";
import { KeyvFile } from "keyv-file";

class Cache {
  /**
   * @param {Object?} store
   */
  constructor(store) {
    this.store = store;
  }

  /**
   * @param {string} url
   * @returns {Promise<string>}
   */
  async get(url) {
    if (null === this.store) {
      return null;
    }

    return this.store.get(url).then((content) => {
      if (content) {
        debug(`hit found for ${url}`);
      }

      return content;
    });
  }

  /**
   * @param {string} url
   * @param {string|Object} content
   * @returns {Promise<void>}
   */
  async set(url, content) {
    if (null === this.store) {
      return null;
    }

    return this.store.set(url, content).then(() => {
      debug(`stored ${url}`);
    });
  }

  /**
   * @returns {Promise<void>}
   */
  async clear() {
    if (null === this.store) {
      return null;
    }

    return this.store.clear();
  }

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  async delete(url) {
    if (null === this.store || !url) {
      return null;
    }

    return this.store.delete(url);
  }
}

/**
 * @returns {Cache}
 * @constructor
 */
export const NullCache = () => new Cache(null);

/**
 * @returns {Cache}
 * @constructor
 */
export const MemoryCache = () => new Cache(new KeyValue({}));

/**
 * @param {string} filePath
 * @returns {Cache}
 * @constructor
 */
export const FileCache = (filePath) =>
  new Cache(new KeyValue({ store: new KeyvFile({ filename: filePath }) }));

export const detectStore = () => {
  if (process.env.NO_CACHE === "true") {
    debug("is completely disabled");
    return null;
  }

  let config = {};

  if (process.env.CACHE_FILE) {
    config.store = new KeyvFile({
      filename: process.env.CACHE_FILE,
    });
  }

  return new KeyValue(config);
};

/**
 * @param {"memory"|string|false|true} type
 * @returns {Cache}
 * @throws Error
 */
export const cacheFactory = (type) => {
  if (false === type) {
    return NullCache();
  }

  if (true === type || "memory" === type) {
    return MemoryCache();
  }

  if (typeof type === "string") {
    return FileCache(type);
  }

  throw new Error("Unsupported type of cache");
};

export const EnvironmentCache = () => new Cache(detectStore());

export default Cache;
