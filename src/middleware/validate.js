// src/middleware/validate.js
/**
 * Minimal, dependency-free body field checker.
 * Usage: app.post('/x', requireFields(['title','content']), handler)
 */
export function requireFields(fields) {
  return (req, res, next) => {
    for (const f of fields) {
      const v = req.body?.[f];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        return res.status(400).json({ error: `Missing field: ${f}` });
      }
    }
    next();
  };
}
