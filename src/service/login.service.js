const joi = require('joi');

const { User } = require('../sequelize/models');
const { BAD_REQUEST } = require('../utils/httpStatus');
const { getToken } = require('../jwt/jwt');

const throwInvalid = () => {
  const err = new Error('Invalid fields');
  err.status = BAD_REQUEST;
  err.message = 'Invalid fields';
  throw err;
};

const checkLoginData = (data) => {
  const { error } = joi.object({
    email: joi.string().empty()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().empty().required(),
  }).validate(data);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const loginService = async ({ email, password }) => {
  checkLoginData({ email, password });

  const user = await User.findOne({ where: { email } });
  
  if (user === null) throwInvalid();
  if (password !== user.password) throwInvalid();

  const token = getToken({ email, id: user.id });

  return { token };
};

module.exports = {
  loginService,
};
