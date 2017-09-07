module.exports = class CustomError extends Error {
  
  constructor(status, message, result) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
    this.result = result;
  }
};
