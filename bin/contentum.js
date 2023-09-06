#!/usr/bin/env node

const dotenv = require("dotenv");

const DEBUG = "contentum*";

/**
 * @param {dotenv.DotenvPopulateInput} obj
 */
const setEnv = (obj = {}) => {
  dotenv.populate(process.env, obj, { override: true });
};

const { program } = require("commander");
const packageJson = require("./../package.json");

program
  .name(packageJson.name)
  .description(packageJson.description)
  .option("-p --port <port>", "port", "3000")
  .option("-w --workers <workers>", "workers amount", "1")
  .option("-d --debug", "enable debug", false)
  .option("-n --no-cache", "disable cache", true)
  .option("-f --file <file>", "cache filepath")
  .option("--bin <bin>", "chromium bin location", "/usr/bin/chromium")
  .option("--env", "load environment variables", false)
  .version(packageJson.version);

program.parse(process.argv);

const options = program.opts();

if (options.env) {
  dotenv.config();

  if (process.env.NO_CACHE) {
    options.cache = false;
  }

  if (process.env.DEBUG) {
    setEnv({ DEBUG });
  }
} else {
  if (options.debug) {
    setEnv({ DEBUG });
  }

  if (options.file) {
    setEnv({ CACHE_FILE: options.file });
  }

  if (options.bin) {
    setEnv({ CHROME_BIN: options.bin });
  }
}

const debug = require("debug")("contentum");
const app = require("../server");
const contentum = app(program.opts().workers, options.cache);

contentum.listen(options.port, "0.0.0.0", () => {
  debug(`is listening on ${options.port} port`);
});
