const express = require('express');

const errorMiddleware = require('../middlewares/errorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  registerUserController,
  getAllUsersController,
  getUserByIdController,
  deleteUserController,
} = require('../controller/users.controller');

const router = express.Router();

router.post('/', registerUserController);

router.use(authMiddleware);

router.get('/', getAllUsersController);

router.get('/:id', getUserByIdController);

router.delete('/me', deleteUserController);

router.use(errorMiddleware);

module.exports = router;
