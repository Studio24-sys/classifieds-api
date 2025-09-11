// Simple validation helper with detailed messages
export function requireFields(fields) {
  return (req, res, next) => {
    const missing = [];
    for (const f of fields) {
      const v = req.body?.[f];
      if (v === undefined || v === null || (typeof v === 'string' && v.trim() === '')) {
        missing.push(f);
      }
    }
    if (missing.length) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        detail: missing.map((f) => ({ field: f, message: `${f} is required` })),
      });
    }
    next();
  };
}
