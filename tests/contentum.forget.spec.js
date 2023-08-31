const { describe, test, expect } = require("@jest/globals");
const Contentum = require("../lib/contentum");
const Content = require("./../lib/content");

const GOOGLE = "https://google.com/";
const FACEBOOK = "https://facebook.com/";

const CACHED_CONTENT = "cached content";

describe("Contentum.forget()", () => {
  test("it should forget the cache:forget(url))", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);

    const result = await contentum.forget(GOOGLE);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(202);
    expect(result.content).toBe("");
    expect(await contentum.cache.get(GOOGLE)).toBeUndefined();
  });

  test("it should forget all the cache:forget(*))", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);
    await contentum.cache.set(FACEBOOK, CACHED_CONTENT);

    const result = await contentum.forget("*");

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(202);
    expect(result.content).toBe("");
    expect(await contentum.cache.get(GOOGLE)).toBeUndefined();
    expect(await contentum.cache.get(FACEBOOK)).toBeUndefined();
  });

  test("it should work with empty cache:forget(url))", async () => {
    const contentum = new Contentum(1);

    const result = await contentum.forget(GOOGLE);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(202);
    expect(result.content).toBe("");
  });
});
