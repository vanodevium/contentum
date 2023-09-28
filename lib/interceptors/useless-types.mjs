const useful = ["document", "script", "xhr", "fetch"];

/**
 * @param {Object} request
 * @returns {boolean}
 */
export default function (request) {
  if (!~useful.indexOf(request.resourceType())) {
    return true;
  }
}
