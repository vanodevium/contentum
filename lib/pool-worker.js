const Worker = require("./worker");
const workerPool = require("workerpool");

const worker = new Worker();

async function processPage(options) {
  await worker.init();
  return worker.process(options);
}

workerPool.worker({
  processPage: processPage,
});
