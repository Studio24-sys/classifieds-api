// Minimal validators without external deps

export function requireBodyFields(fields = []) {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({ error: 'BODY_REQUIRED' });
    }
    for (const f of fields) {
      if (
        !(f in req.body) ||
        req.body[f] === undefined ||
        req.body[f] === null ||
        (typeof req.body[f] === 'string' && req.body[f].trim() === '')
      ) {
        return res.status(400).json({ error: `MISSING_${f.toUpperCase()}` });
      }
    }
    next();
  };
}

export function optionalString(field, maxLen = 2000) {
  return (req, res, next) => {
    const v = req.body?.[field];
    if (v === undefined || v === null) return next();
    if (typeof v !== 'string') {
      return res.status(400).json({ error: `INVALID_${field.toUpperCase()}` });
    }
    if (v.length > maxLen) {
      return res.status(400).json({ error: `${field.toUpperCase()}_TOO_LONG` });
    }
    next();
  };
}
