const { describe, test, expect } = require("@jest/globals");

const Contentum = require("../lib/contentum");

const GOOGLE = "https://google.com";

describe("Contentum.normalizeUrl()", () => {
  test("it should return normalized URL", async () => {
    const contentum = new Contentum(1);

    expect(contentum.normalizeUrl(GOOGLE)).toBe("https://google.com/");
  });

  test("it should return normalized URL with identifier", async () => {
    const contentum = new Contentum(1);

    expect(contentum.normalizeUrl(GOOGLE, true)).toBe(
      "https://google.com/?_contentum_=true"
    );
  });

  test("it should return empty string", async () => {
    const contentum = new Contentum(1);

    expect(contentum.normalizeUrl("i'm not an URL")).toBe("");
  });
});
