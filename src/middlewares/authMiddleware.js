const rescue = require('express-rescue');
const { decodeToken } = require('../jwt/jwt');
const { User } = require('../sequelize/models');  
const { UNAUTHORIZED } = require('../utils/httpStatus');

const jwtErroThrow = () => {
  const err = new Error('Expired or invalid token');
  err.status = UNAUTHORIZED;
  err.message = 'Expired or invalid token';
  throw err;
};

const handleToken = async (token) => {
  const { data } = decodeToken(token);
  const user = await User.findOne({ where: { email: data.email } });

  if (user === null) jwtErroThrow();

  const { id, email } = user;
  if (data.email !== email || data.id !== id) jwtErroThrow(); 

  return { email, id };
};

module.exports = rescue(async (req, _res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    const err = new Error('Token not found');
    err.status = UNAUTHORIZED;
    err.message = 'Token not found';
    throw err;
  }

  const user = await handleToken(authorization);

  req.body.user = user;

  next();
});
