const debug = require("debug")("sssr:limiter");
const genericPool = require("generic-pool");

const initWorker = require("./worker").initWorker;

class Limiter {
  /**
   * @param {number} workers
   */
  constructor(workers) {
    this.limit = Math.max(+workers, 1);

    this.pool = genericPool.createPool(
      {
        create: () => initWorker(),
        destroy: async (worker) => {
          return worker.browser?.close();
        },
      },
      {
        max: this.limit,
        min: 1,
      }
    );

    debug("started");
  }

  /**
   * @param {Object} task
   * @returns {Promise<*>}
   */
  async process(task) {
    return this.pool.acquire().then((worker) => {
      return worker.process(task).finally(() => {
        this.pool.release(worker);
      });
    });
  }
}

module.exports = Limiter;
