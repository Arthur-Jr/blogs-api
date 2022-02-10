const express = require('express');
const { loginController } = require('../controller/login.controller');
const errorMiddleware = require('../middlewares/errorMiddleware');

const router = express.Router();

router.post('/', loginController);

router.use(errorMiddleware);

module.exports = router;
