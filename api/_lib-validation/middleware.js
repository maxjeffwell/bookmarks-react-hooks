import { ZodError } from 'zod';

/**
 * Format Zod errors into a consistent response format
 * @param {ZodError} error - Zod validation error
 * @returns {Object} Formatted error response
 */
export function formatZodError(error) {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }));

  return {
    error: 'Validation failed',
    details: errors
  };
}

/**
 * Validate data against a schema (for serverless functions)
 * @param {Object} schema - Zod schema
 * @param {Object} data - Data to validate
 * @returns {Object} { success: boolean, data?: validated, error?: formatted }
 */
export async function validateData(schema, data) {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error: formatZodError(error) };
    }
    throw error;
  }
}

/**
 * Express middleware factory for validation
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
        return res.status(400).json(formatZodError(error));
      }
      next(error);
    }
  };
}

/**
 * Shorthand for body-only validation (Express)
 */
export function validateBody(schema) {
  return validate({ body: schema });
}

/**
 * Shorthand for params-only validation (Express)
 */
export function validateParams(schema) {
  return validate({ params: schema });
}
