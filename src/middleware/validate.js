// src/middleware/validate.js

/**
 * Validate that specific body fields exist and are non-empty strings.
 * Usage: app.post('/route', validateBody(['email','password']), handler)
 */
export function validateBody(requiredKeys = []) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'BAD_REQUEST', detail: 'Body must be JSON object' });
    }
    for (const key of requiredKeys) {
      const v = req.body[key];
      if (typeof v !== 'string' || v.trim() === '') {
        return res.status(400).json({ error: 'BAD_REQUEST', detail: `Missing or empty field: ${key}` });
      }
    }
    next();
  };
}
