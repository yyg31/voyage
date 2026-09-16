const ApiError = require('../utils/ApiError');

// Validates req[part] (default "body") against a zod schema, replacing it with the parsed value.
function validate(schema, part = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      return next(ApiError.badRequest('Validation failed', result.error.flatten()));
    }
    req[part] = result.data;
    next();
  };
}

module.exports = validate;
