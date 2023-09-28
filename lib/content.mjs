/**
 * @typedef ContentResponseOptions
 * @type {Object}
 * @property {?string} uri
 * @property {?string} body
 * @property {?Object} headers
 * @property {?number} status
 * @property {?string} statusText
 */

class Content {
  /**
   * @param {String|ContentResponseOptions} uriOrOptions
   * @param {?String} body
   * @param {?Object} headers
   * @param {?number} status
   * @param {?String} statusText
   */
  constructor(
    uriOrOptions,
    body = "",
    headers = null,
    status = 200,
    statusText = "Ok",
  ) {
    if (typeof uriOrOptions !== "string") {
      this.status = uriOrOptions.status;
      this.statusText = uriOrOptions.statusText;
      this.body = uriOrOptions.body;
      this.headers = uriOrOptions.headers;
      this.uri = uriOrOptions.uri;
    } else {
      this.status = status;
      this.statusText = statusText;
      this.body = body;
      this.headers = headers;
      this.uri = uriOrOptions;
    }
  }
}

export default Content;
