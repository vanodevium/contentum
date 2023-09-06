const workerPool = require("workerpool");
const Worker = require("./worker");

const worker = new Worker();

async function processPage(options) {
  try {
    const result = await worker.process(options);
    workerPool.workerEmit({ content: result });
    return result;
  } catch (e) {
    workerPool.workerEmit({ error: true, message: e.message, code: e.code });
  }
}

workerPool.worker({
  processPage: processPage,
});
