const workerPool = require("workerpool");
const Worker = require("./worker");

const worker = new Worker();

async function processPage(options) {
  return worker.process(options);
}

workerPool.worker({
  processPage: processPage,
});
