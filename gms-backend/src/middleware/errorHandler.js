export function notFoundHandler(req, res, next) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err, req, res, next) {
  console.error('Unhandled Error:', err);

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    const fields = err.meta?.target || ['field'];
    return res.status(409).json({
      error: `A record with this ${Array.isArray(fields) ? fields.join(', ') : fields} already exists`
    });
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    return res.status(404).json({
      error: 'Requested record not found in database'
    });
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
}
