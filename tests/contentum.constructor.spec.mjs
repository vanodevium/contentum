import { describe, test } from "mocha";
import { expect } from "chai";
import Contentum from "../lib/contentum.mjs";
import KeyValue from "keyv";
import { KeyvFile } from "keyv-file";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

describe("Contentum.constructor", () => {
  test("should have null cache", async () => {
    const contentum = new Contentum(1, false);
    expect(contentum.cache.store).to.be.null;
  });

  test("should have memory cache", async () => {
    const contentum = new Contentum(1, "memory");
    expect(contentum.cache.store).to.be.instanceof(KeyValue);
    expect(contentum.cache.store.opts.store).to.be.instanceof(Map);
  });

  test("should have file cache", async () => {
    const contentum = new Contentum(1, __filename);
    expect(contentum.cache.store).to.be.instanceof(KeyValue);
    expect(contentum.cache.store.opts.store).to.be.instanceof(KeyvFile);
    expect(contentum.cache.store.opts.store._opts.filename).to.eq(__filename);
  });

  test("should have environment cache", async () => {
    const contentum = new Contentum(1);
    expect(contentum.cache.store).to.be.instanceof(KeyValue);
    expect(contentum.cache.store.opts.store).to.be.instanceof(Map);
  });

  test("should have max 1 worker", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).to.eq(0);
    expect(contentum.pool._pool.maxWorkers).to.eq(1);
  });

  test("should have max 1 worker anyway", async () => {
    const contentum = new Contentum(0);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).to.eq(0);
    expect(contentum.pool._pool.maxWorkers).to.eq(1);
  });

  test("should have max 1 worker anyway", async () => {
    const contentum = new Contentum(undefined);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).to.eq(0);
    expect(contentum.pool._pool.maxWorkers).to.eq(1);
  });

  test("should have max 3 workers", async () => {
    const contentum = new Contentum(3);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).to.eq(0);
    expect(contentum.pool._pool.maxWorkers).to.eq(3);
  });
});
