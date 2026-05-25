import { ValidationAppError } from '../utils/errors.js';

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      { body: req.body, params: req.params, query: req.query },
      { abortEarly: false, stripUnknown: true }
    );
    if (error) {
      return next(
        new ValidationAppError(
          error.details.map((d) => d.message).join(', '),
          error.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
        )
      );
    }
    req.body = value.body ?? req.body;
    req.params = value.params ?? req.params;
    req.query = value.query ?? req.query;
    next();
  };
}
