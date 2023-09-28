import { describe, test } from "mocha";
import { expect } from "chai";
import Contentum from "../lib/contentum.mjs";

const GOOGLE = "https://google.com";

describe("Contentum.normalizeUrl()", () => {
  test("it should return normalized URL", async () => {
    const contentum = new Contentum(1);

    expect(contentum.normalizeUrl(GOOGLE)).to.eq("https://google.com/");
  });

  test("it should return normalized URL with identifier", async () => {
    const contentum = new Contentum(1);

    expect(contentum.normalizeUrl(GOOGLE, true)).to.eq(
      "https://google.com/?_contentum_=1",
    );
  });

  test("it should return empty string", async () => {
    const contentum = new Contentum(1);

    expect(contentum.normalizeUrl("i'm not an URL")).to.eq("");
  });
});
