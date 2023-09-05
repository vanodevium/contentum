const debug = require("debug")("contentum:pool");
const workerPool = require("workerpool");

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
    return this._pool.proxy().then((worker) => {
      return worker.processPage(task);
    });
  }
}

module.exports = Pool;
