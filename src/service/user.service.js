const joi = require('joi');

const { User } = require('../sequelize/models');
const { BAD_REQUEST, CONFLICT, NOT_FOUND } = require('../utils/httpStatus');
const { getToken } = require('../jwt/jwt');

const throwAlreadyExist = () => {
  const err = new Error('User already registered');
  err.status = CONFLICT;
  err.message = 'User already registered';
  throw err;
};

const throwNotFound = () => {
  const err = new Error('User does not exist');
  err.status = NOT_FOUND;
  err.message = 'User does not exist';
  throw err;
};

const checkUserData = (data) => {
  const { error } = joi.object({
    displayName: joi.string().min(8).required(),
    password: joi.string().length(6).required(),
    email: joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
  }).validate(data);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const checkId = (id) => {
  const { error } = joi.number().required().validate(id);

  if (error) {
    const err = new Error('Invalid Id');
    err.status = BAD_REQUEST;
    err.message = 'Invalid Id';
    throw err;
  }
};

const registerUserService = async ({ displayName, email, password, image = null }) => {
  checkUserData({ displayName, email, password });

  const checkDuplicity = await User.findOne({ where: { email } });
  if (checkDuplicity !== null) throwAlreadyExist();

  const { dataValues } = await User.create({ displayName, email, password, image });

  const token = getToken({ email, id: dataValues.id });

  return { token };
};

const getAllUsersService = async () => User.findAll();

const getUserByIdService = async (userId) => {
  checkId(userId);

  const user = await User.findByPk(userId);

  if (user === null) throwNotFound();

  return user;
};

const deleteUserService = async (userId) => {
  const user = await User.findByPk(userId);
  await user.destroy();
};

module.exports = {
  registerUserService,
  getAllUsersService,
  getUserByIdService,
  deleteUserService,
};
