import { default as Debug } from "debug";
const debug = Debug("contentum:pool");

import workerPool from "workerpool";
import ContentError from "./error.mjs";

import path from "path";
const __dirname = path.resolve(
  path.dirname(decodeURI(new URL(import.meta.url).pathname)),
);

class Pool {
  /**
   * @param {Number} workers
   * @returns {Promise<Pool>}
   */
  static async init(workers) {
    const pool = new Pool();

    pool.limit = Math.max(+workers, 1);

    pool._pool = workerPool.pool(__dirname + "/pool-worker.mjs", {
      minWorkers: 0,
      maxWorkers: pool.limit,
      workerType: "process",
    });

    debug("started");

    return pool;
  }

  /**
   * @param {Object} task
   * @returns {Promise<Content>}
   */
  async process(task) {
    return new Promise((resolve, reject) => {
      this._pool
        .exec("processPage", [task], {
          on: (data) => {
            if (data.error) {
              return reject(new ContentError(data.message, data.code));
            }
            resolve(data);
          },
        })
        .catch(reject);
    });
  }
}

export default Pool;
