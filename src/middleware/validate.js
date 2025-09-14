// Lightweight validators with useful messages

export function requireString(field, min = 1, max = 1000) {
  return (v, errors) => {
    if (typeof v !== 'string') {
      errors.push(`${field} must be a string`);
      return;
    }
    const trimmed = v.trim();
    if (trimmed.length < min) errors.push(`${field} must be at least ${min} characters`);
    if (trimmed.length > max) errors.push(`${field} must be at most ${max} characters`);
  };
}

export function isEmail(field = 'email') {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
  return (v, errors) => {
    if (typeof v !== 'string' || !re.test(v)) errors.push(`${field} must be a valid email`);
  };
}

export function validate(body, shape) {
  const errors = [];
  for (const [key, rules] of Object.entries(shape)) {
    const val = body[key];
    for (const rule of rules) rule(val, errors);
  }
  if (errors.length) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.expose = true;
    err.payload = { errors };
    throw err;
  }
}
