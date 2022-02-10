const jwt = require('jsonwebtoken');
const { UNAUTHORIZED } = require('../utils/httpStatus');
require('dotenv').config();

const secret = process.env.JWT_SECRET;

const jwtConfig = {
  expiresIn: '8h',
  algorithm: 'HS256',
};

const getToken = (data) => jwt.sign({ data }, secret, jwtConfig);

const decodeToken = (token) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    const err = new Error('Expired or invalid token');
    err.status = UNAUTHORIZED;
    err.message = 'Expired or invalid token';
    throw err;
  }
};

module.exports = {
  getToken,
  decodeToken,
};
