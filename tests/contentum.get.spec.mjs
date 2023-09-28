import { describe, test } from "mocha";
import { expect } from "chai";
import { fake, spy } from "sinon";
import Contentum, { DefaultPageOptions } from "../lib/contentum.mjs";
import Content from "../lib/content.mjs";

const GOOGLE = "https://google.com/";

const CACHED_CONTENT = "cached content";
const ORIGINAL_CONTENT = "original content";

describe("Contentum.get()", () => {
  test("it should skip the cache:get(url, {}, false)", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();

    await contentum.cache.set(
      GOOGLE,
      new Content(GOOGLE, CACHED_CONTENT, {}, 200),
    );

    contentum.pool.process = fake.returns(
      Promise.resolve(
        new Content({
          uri: GOOGLE,
          body: ORIGINAL_CONTENT,
          status: 200,
        }),
      ),
    );

    const result = await contentum.get(GOOGLE, null, false);

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(200);
    const content = await result.text();
    expect(content).not.to.eq(CACHED_CONTENT);
    expect(content).to.eq(ORIGINAL_CONTENT);
  });

  test("it should skip the cache:getWithCache(url, {})", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();

    await contentum.cache.set(
      GOOGLE,
      new Content(GOOGLE, CACHED_CONTENT, {}, 200),
    );

    contentum.pool.process = fake.returns(
      Promise.resolve(
        new Content({
          uri: GOOGLE,
          body: ORIGINAL_CONTENT,
          status: 200,
        }),
      ),
    );

    const result = await contentum.getWithCache(GOOGLE, {});

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(200);
    const content = await result.text();
    expect(content).not.to.eq(ORIGINAL_CONTENT);
    expect(content).to.eq(CACHED_CONTENT);
  });

  test("it should skip the cache:getWithoutCache(url, {})", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();

    await contentum.cache.set(
      GOOGLE,
      new Content(GOOGLE, CACHED_CONTENT, {}, 200),
    );

    contentum.pool.process = fake.returns(
      Promise.resolve(
        new Content({
          uri: GOOGLE,
          body: ORIGINAL_CONTENT,
          status: 200,
        }),
      ),
    );

    const result = await contentum.getWithoutCache(GOOGLE, {});

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(200);
    const content = await result.text();
    expect(content).not.to.eq(CACHED_CONTENT);
    expect(content).to.eq(ORIGINAL_CONTENT);
  });

  test("it should put to the cache:get(url)", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();

    contentum.pool.process = fake.returns(
      Promise.resolve(
        new Content({
          uri: GOOGLE,
          body: ORIGINAL_CONTENT,
          status: 200,
        }),
      ),
    );

    const result = await contentum.get(GOOGLE);

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(200);
    expect(await result.text()).to.eq(ORIGINAL_CONTENT);

    expect((await contentum.cache.get(GOOGLE)).body).to.eq(ORIGINAL_CONTENT);
  });

  test("it should pass options:get(url, {...})", async () => {
    const contentum = new Contentum(1);
    await contentum.initPool();
    const headers = { "user-agent": "curl/client" };

    contentum.pool.process = fake.returns(Promise.resolve());

    const makePageOptionsSpy = spy(contentum, "makePageOptions");

    await contentum.get(GOOGLE, { headers });

    expect(makePageOptionsSpy.called).to.be.true;
  });
});
