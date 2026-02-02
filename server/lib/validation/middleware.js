import { ZodError } from 'zod';

/**
 * Validation middleware factory
 * @param {Object} schemas - Object with body, params, query schemas
 * @returns {Function} Express middleware
 */
export function validate(schemas) {
  return async (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }
      next(error);
    }
  };
}

/**
 * Shorthand for body-only validation
 */
export function validateBody(schema) {
  return validate({ body: schema });
}

/**
 * Shorthand for params-only validation
 */
export function validateParams(schema) {
  return validate({ params: schema });
}
