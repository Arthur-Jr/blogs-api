const rescue = require('express-rescue');
const { CREATED, HTTP_OK_STATUS } = require('../utils/httpStatus');
const { addCategoryService, getAllCategoriesService } = require('../service/categories.service');

const addCategoryController = rescue(async (req, res) => {
  const { name } = req.body;

  const category = await addCategoryService(name);

  return res.status(CREATED).json(category);
});

const getAllCategoriesController = rescue(async (_req, res) => {
  const categories = await getAllCategoriesService();

  return res.status(HTTP_OK_STATUS).json(categories);
});

module.exports = {
  addCategoryController,
  getAllCategoriesController,
};
