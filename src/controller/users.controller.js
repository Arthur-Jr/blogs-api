const rescue = require('express-rescue');

const { HTTP_OK_STATUS, CREATED, NO_CONTENT } = require('../utils/httpStatus');
const {
  registerUserService,
  getAllUsersService,
  getUserByIdService,
  deleteUserService,
} = require('../service/user.service');

const registerUserController = rescue(async (req, res) => {
  const { displayName, email, password, image } = req.body;

  const token = await registerUserService({ displayName, email, password, image });

  return res.status(CREATED).json(token);
});

const getAllUsersController = rescue(async (_req, res) => {
  const users = await getAllUsersService();

  return res.status(HTTP_OK_STATUS).json(users);
});

const getUserByIdController = rescue(async (req, res) => {
  const { id } = req.params;

  const user = await getUserByIdService(id);

  return res.status(HTTP_OK_STATUS).json(user);
});

const deleteUserController = rescue(async (req, res) => {
  const { user: { id } } = req.body;

  await deleteUserService(id);

  return res.status(NO_CONTENT).send();
});

module.exports = {
  registerUserController,
  getAllUsersController,
  getUserByIdController,
  deleteUserController,
};
