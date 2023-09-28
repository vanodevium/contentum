import { describe, test } from "mocha";
import { expect } from "chai";
import Contentum from "../lib/contentum.mjs";

const GOOGLE = "https://google.com/";
const FACEBOOK = "https://facebook.com/";

const CACHED_CONTENT = "cached content";

describe("Contentum.forget()", () => {
  test("it should forget the cache:forget(url))", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);

    const result = await contentum.forget(GOOGLE);

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(202);
    expect(await result.text()).to.eq("");
    expect(await contentum.cache.get(GOOGLE)).to.be.undefined;
  });

  test("it should forget all the cache:forget(*))", async () => {
    const contentum = new Contentum(1);

    await contentum.cache.set(GOOGLE, CACHED_CONTENT);
    await contentum.cache.set(FACEBOOK, CACHED_CONTENT);

    const result = await contentum.forget("*");

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(202);
    expect(await result.text()).to.eq("");
    expect(await contentum.cache.get(GOOGLE)).to.be.undefined;
    expect(await contentum.cache.get(FACEBOOK)).to.be.undefined;
  });

  test("it should work with empty cache:forget(url))", async () => {
    const contentum = new Contentum(1);

    const result = await contentum.forget(GOOGLE);

    expect(result).to.be.instanceof(Response);
    expect(result.status).to.eq(202);
    expect(await result.text()).to.eq("");
  });
});
