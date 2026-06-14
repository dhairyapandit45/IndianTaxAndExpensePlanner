import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret_key';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { id: decoded.id };
      return next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed.' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided.' });
    return;
  }
};