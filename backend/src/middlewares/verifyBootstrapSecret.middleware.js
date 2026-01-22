export const verifyBootstrapSecret = (req, res, next) => {
  const secret = req.headers['x-bootstrap-secret'] || req.query.secret;

  if (!secret || secret !== process.env.BOOTSTRAP_SECRET_KEY) {
    return res.status(403).json({
      message: 'Forbidden',
    });
  }

  next();
};
