const { describe, test, expect } = require("@jest/globals");
const Contentum = require("../lib/contentum");
const KeyValue = require("keyv");
const { default: KeyValueFile } = require("keyv-file");

describe("Contentum.constructor", () => {
  test("should have null cache", async () => {
    const contentum = new Contentum(1, false);
    expect(contentum.cache.store).toBeNull();
  });

  test("should have memory cache", async () => {
    const contentum = new Contentum(1, "memory");
    expect(contentum.cache.store).toBeInstanceOf(KeyValue);
    expect(contentum.cache.store.opts.store).toBeInstanceOf(Map);
  });

  test("should have file cache", async () => {
    const contentum = new Contentum(1, __filename);
    expect(contentum.cache.store).toBeInstanceOf(KeyValue);
    expect(contentum.cache.store.opts.store).toBeInstanceOf(KeyValueFile);
    expect(contentum.cache.store.opts.store._opts.filename).toBe(__filename);
  });

  test("should have environment cache", async () => {
    const contentum = new Contentum(1);
    expect(contentum.cache.store).toBeInstanceOf(KeyValue);
    expect(contentum.cache.store.opts.store).toBeInstanceOf(Map);
  });

  test("should have max 1 worker", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).toBe(0);
    expect(contentum.pool._pool.maxWorkers).toBe(1);
  });

  test("should have max 1 worker anyway", async () => {
    const contentum = new Contentum(0);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).toBe(0);
    expect(contentum.pool._pool.maxWorkers).toBe(1);
  });

  test("should have max 1 worker anyway", async () => {
    const contentum = new Contentum(undefined);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).toBe(0);
    expect(contentum.pool._pool.maxWorkers).toBe(1);
  });

  test("should have max 3 workers", async () => {
    const contentum = new Contentum(3);
    await contentum.initPool();
    expect(contentum.pool._pool.minWorkers).toBe(0);
    expect(contentum.pool._pool.maxWorkers).toBe(3);
  });
});
