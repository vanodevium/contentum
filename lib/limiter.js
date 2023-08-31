const debug = require("debug")("contentum:limiter");
const workerPool = require("workerpool");

class Limiter {
  /**
   * @param {number} workers
   */
  constructor(workers) {
    this.limit = Math.max(+workers, 1);

    this.pool = workerPool.pool(__dirname + "/pool-worker.js", {
      minWorkers: 0,
      maxWorkers: this.limit,
      workerType: "process",
    });

    debug("started");
  }

  /**
   * @param {Object} task
   * @returns {Promise<*>}
   */
  async process(task) {
    return this.pool.proxy().then((worker) => {
      return worker.processPage(task);
    });
  }
}

module.exports = Limiter;
