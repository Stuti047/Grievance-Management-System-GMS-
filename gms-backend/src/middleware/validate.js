export function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.safeParse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || 'Validation error';
        return res.status(400).json({
          error: firstError,
          details: parsed.error.issues.map(i => ({
            field: i.path.join('.').replace(/^body\.|^query\.|^params\./, ''),
            message: i.message
          }))
        });
      }

      // Assign parsed values
      if (parsed.data.body) req.body = parsed.data.body;
      if (parsed.data.query) req.query = parsed.data.query;
      if (parsed.data.params) req.params = parsed.data.params;

      next();
    } catch (err) {
      next(err);
    }
  };
}
