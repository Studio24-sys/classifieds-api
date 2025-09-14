export default function handler(req, res) {
  if (req.url.startsWith('/api/health')) {
    res.status(200).json({ ok: true, message: 'PURE handler alive' });
    return;
  }
  if (req.url.startsWith('/api/_whoami')) {
    res.status(200).json({
      node: process.version,
      env: {
        NODE_ENV: process.env.NODE_ENV ?? null,
        PORT: process.env.PORT ?? null,
      },
      now: new Date().toISOString(),
    });
    return;
  }
  res.status(404).json({ error: 'NOT_FOUND', path: req.url });
}
