class ContentError extends Error {
  constructor(message, code = 400) {
    super(message);
    this.code = code;
  }
}

export default ContentError;
