const { describe, test, expect } = require("@jest/globals");
const Contentum = require("../lib/contentum");
const Content = require("./../lib/content");

const GOOGLE = "https://google.com/";

const CACHED_CONTENT = "cached content";
const ORIGINAL_CONTENT = "original content";

describe("Contentum.get()", () => {
  test("it should skip the cache:get(url, {}, false)", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);

    contentum.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contentum.get(GOOGLE, null, false);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).not.toBe(CACHED_CONTENT);
    expect(result.content).toBe(ORIGINAL_CONTENT);
  });

  test("it should skip the cache:getWithCache(url, {})", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);

    contentum.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contentum.getWithCache(GOOGLE, {});

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).not.toBe(ORIGINAL_CONTENT);
    expect(result.content).toBe(CACHED_CONTENT);
  });

  test("it should skip the cache:getWithoutCache(url, {})", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);

    contentum.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contentum.getWithoutCache(GOOGLE, {});

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).not.toBe(CACHED_CONTENT);
    expect(result.content).toBe(ORIGINAL_CONTENT);
  });

  test("it should put to the cache:get(url)", async () => {
    const contentum = new Contentum(1);

    contentum.limiter.process = jest.fn(() =>
      Promise.resolve(ORIGINAL_CONTENT)
    );

    const result = await contentum.get(GOOGLE);

    expect(result).toBeInstanceOf(Content);
    expect(result.status).toBe(200);
    expect(result.content).toBe(ORIGINAL_CONTENT);

    expect(await contentum.cache.get(GOOGLE)).toBe(ORIGINAL_CONTENT);
  });

  test("it should pass options:get(url, {...})", async () => {
    const contentum = new Contentum(1);
    const headers = { "user-agent": "curl/client" };

    contentum.limiter.process = jest
      .spyOn(contentum.limiter, "process")
      .mockImplementation(() => Promise.resolve());

    const spy = jest.spyOn(contentum, "makePageOptions");

    await contentum.get(GOOGLE, { headers });

    const options = Object.assign(Contentum.DefaultPageOptions, {
      headers,
    });

    expect(spy).toHaveBeenCalledWith(GOOGLE, options);
  });
});
