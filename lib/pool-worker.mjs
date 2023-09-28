import workerPool from "workerpool";
import Worker from "./worker.mjs";

const worker = new Worker();

async function processPage(options) {
  try {
    workerPool.workerEmit(await worker.process(options));
  } catch (e) {
    workerPool.workerEmit({ error: true, message: e.message, code: e.code });
  }
}

workerPool.worker({
  processPage: processPage,
});
