// api/index.js
import app from '../app.js';

// Vercel serverless handler – Express app is a request handler
export default function handler(req, res) {
  return app(req, res);
}