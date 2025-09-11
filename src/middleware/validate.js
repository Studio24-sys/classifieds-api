// src/middleware/validate.js
export const validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });
  if (!parsed.success) {
    return res.status(400).json({
      error: 'VALIDATION_FAILED',
      details: parsed.error.flatten(),
    });
  }
  if (parsed.data.body) req.body = parsed.data.body;
  if (parsed.data.params) req.params = parsed.data.params;
  if (parsed.data.query) req.query = parsed.data.query;
  next();
};
