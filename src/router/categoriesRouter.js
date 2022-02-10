const express = require('express');

const errorMiddleware = require('../middlewares/errorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  addCategoryController,
  getAllCategoriesController,
} = require('../controller/categories.controller');

const router = express.Router();

router.use(authMiddleware);

router.post('/', addCategoryController);

router.get('/', getAllCategoriesController);

router.use(errorMiddleware);

module.exports = router;
