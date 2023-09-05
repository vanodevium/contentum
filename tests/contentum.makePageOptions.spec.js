const { describe, test, expect } = require("@jest/globals");
const Contentum = require("../lib/contentum");
const Worker = require("../lib/worker");
const DefaultOptions = Contentum.DefaultPageOptions;

const GOOGLE = "https://google.com/";

const mockPageObject = () => {
  const page = {
    setUserAgent: jest.fn(() => Promise.resolve()),
    setExtraHTTPHeaders: jest.fn(() => Promise.resolve()),
    goto: jest.fn(() => Promise.resolve()),
    waitForSelector: jest.fn(() => Promise.resolve()),
  };

  const userAgentSpy = jest.spyOn(page, "setUserAgent");
  const extraHeadersSpy = jest.spyOn(page, "setExtraHTTPHeaders");
  const gotoSpy = jest.spyOn(page, "goto");
  const selectorSpy = jest.spyOn(page, "waitForSelector");

  return {
    page,
    userAgentSpy,
    extraHeadersSpy,
    gotoSpy,
    selectorSpy,
  };
};

describe("Contentum.makePageOptions()", () => {
  test("it should make configuration with default options", async () => {
    const contentum = new Contentum(1);
    const worker = new Worker();

    const options = contentum.makePageOptions(GOOGLE, DefaultOptions);

    const { page, userAgentSpy, extraHeadersSpy, gotoSpy, selectorSpy } =
      mockPageObject();

    await worker.processPage(page, options);

    expect(userAgentSpy).not.toBeCalled();
    expect(extraHeadersSpy).toBeCalledWith({});
    expect(gotoSpy).toBeCalledWith(contentum.normalizeUrl(GOOGLE, true), {
      timeout: DefaultOptions.timeout,
      waitUntil: DefaultOptions.waitUntil,
    });
    expect(selectorSpy).toBeCalledWith("body", {
      timeout: DefaultOptions.timeout,
    });
  });

  test("it should make configuration with user-agent header", async () => {
    const contentum = new Contentum(1);
    const worker = new Worker();

    const options = contentum.makePageOptions(
      GOOGLE,
      Object.assign(DefaultOptions, {
        headers: {
          "user-agent": "user/agent/v1.0.0",
        },
      }),
    );

    const { page, userAgentSpy, extraHeadersSpy } = mockPageObject();

    await worker.processPage(page, options);

    expect(userAgentSpy).toBeCalledWith("user/agent/v1.0.0");
    expect(extraHeadersSpy).toBeCalledWith({});
  });

  test("it should make configuration with userAgent option", async () => {
    const contentum = new Contentum(1);
    const worker = new Worker();

    const options = contentum.makePageOptions(
      GOOGLE,
      Object.assign(DefaultOptions, {
        userAgent: "user/agent/v1.0.0",
      }),
    );

    const { page, userAgentSpy, extraHeadersSpy } = mockPageObject();

    await worker.processPage(page, options);

    expect(userAgentSpy).toBeCalledWith("user/agent/v1.0.0");
    expect(extraHeadersSpy).toBeCalledWith({});
  });

  test("it should make configuration with custom headers", async () => {
    const contentum = new Contentum(1);
    const worker = new Worker();

    const options = contentum.makePageOptions(
      GOOGLE,
      Object.assign(DefaultOptions, {
        headers: {
          "x-custom-header": "custom value",
        },
      }),
    );

    const { page, extraHeadersSpy } = mockPageObject();

    await worker.processPage(page, options);

    expect(extraHeadersSpy).toBeCalledWith({
      "x-custom-header": "custom value",
    });
  });

  test("it should make configuration without custom host headers", async () => {
    const contentum = new Contentum(1);
    const worker = new Worker();

    const options = contentum.makePageOptions(
      GOOGLE,
      Object.assign(DefaultOptions, {
        headers: {
          "x-custom-header": "custom value",
          host: GOOGLE,
        },
      }),
    );

    const { page, extraHeadersSpy } = mockPageObject();

    await worker.processPage(page, options);

    expect(extraHeadersSpy).toBeCalledWith({
      "x-custom-header": "custom value",
    });
  });

  test("it should make configuration with waitForSelector option", async () => {
    const contentum = new Contentum(1);
    const worker = new Worker();

    const options = contentum.makePageOptions(
      GOOGLE,
      Object.assign(DefaultOptions, {
        waitForSelector: "#element",
      }),
    );

    const { page, selectorSpy } = mockPageObject();

    await worker.processPage(page, options);

    expect(selectorSpy).toBeCalledWith("#element", {
      timeout: DefaultOptions.timeout,
    });
  });
});
