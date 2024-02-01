const jwt = require('jsonwebtoken');
const AuthError = require('../errors/authError');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthError('Необходима авторизация'));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    payload = jwt.verify(token, 'KEY');
  } catch (error) {
    return next(new AuthError('Необходима авторизация '));
  }

  req.user = payload;

  next();
};
