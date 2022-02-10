const joi = require('joi');
const { BAD_REQUEST } = require('../utils/httpStatus');
const { Category } = require('../sequelize/models');

const checkCategoryData = (data) => {
  const { error } = joi.object({
    name: joi.string().empty().required(),
  }).validate(data);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const addCategoryService = async (name) => {
  checkCategoryData({ name });

  const { dataValues } = await Category.create({ name });

  return dataValues;
};

const getAllCategoriesService = async () => Category.findAll(); 

module.exports = {
  addCategoryService,
  getAllCategoriesService,
};
