const debug = require("debug")("contentum:pool");
const workerPool = require("workerpool");

const ContentError = require("./error");

class Pool {
  /**
   * @param {Number} workers
   * @returns {Promise<Pool>}
   */
  static async init(workers) {
    const pool = new Pool();

    pool.limit = Math.max(+workers, 1);

    pool._pool = workerPool.pool(__dirname + "/pool-worker.js", {
      minWorkers: 0,
      maxWorkers: pool.limit,
      workerType: "process",
    });

    debug("started");

    return pool;
  }

  /**
   * @param {Object} task
   * @returns {Promise<*>}
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
        .then(resolve)
        .catch(reject);
    });
  }
}

module.exports = Pool;
