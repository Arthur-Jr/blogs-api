const joi = require('joi');
const { Op } = require('sequelize');

const { BAD_REQUEST, NOT_FOUND, UNAUTHORIZED } = require('../utils/httpStatus');
const { BlogPost, PostCategory, Category, User } = require('../sequelize/models');

const throwNotFound = () => {
  const err = new Error('Post does not exist');
  err.status = NOT_FOUND;
  err.message = 'Post does not exist';
  throw err;
};

const checkPostData = (data) => {
  const { error } = joi.object({
    title: joi.string().required(),
    content: joi.string().required(),
    categoryIds: joi.array().required(),
  }).validate(data);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }
};

const checkEditData = (data, categoryIds) => {
  const { error } = joi.object({
    title: joi.string().required(),
    content: joi.string().required(),
  }).validate(data);

  if (error) {
    const err = new Error(error.message);
    err.status = BAD_REQUEST;
    err.message = error.message;
    throw err;
  }

  if (categoryIds !== null) {
    const err = new Error('Categories cannot be edited');
    err.status = BAD_REQUEST;
    err.message = 'Categories cannot be edited';
    throw err;
  }
};

const checkPostId = (id) => {
  const { error } = joi.number().required().validate(id);

  if (error) {
    const err = new Error('Invalid Id');
    err.status = BAD_REQUEST;
    err.message = 'Invalid Id';
    throw err;
  }
};

const checkCategoriesId = async (categoriesIds) => {
  const checkArray = await categoriesIds.map(async (categoryId) => {
    const category = await Category.findByPk(categoryId);

    return category === null;
  });

  const checkResult = await Promise.all(checkArray);

  if (checkResult.some((index) => index === true)) {
    const err = new Error('"categoryIds" not found');
    err.status = BAD_REQUEST;
    err.message = '"categoryIds" not found';
    throw err;
  }
};

const checkUserAuth = async (postId, userId) => {
  const post = await BlogPost.findOne({
    where: { id: postId },
    include: { model: Category, as: 'categories', through: { attributes: [] } },
  });

  if (post === null) throwNotFound();

  if (post.userId !== userId) {
    const err = new Error('Unauthorized user');
    err.status = UNAUTHORIZED;
    err.message = 'Unauthorized user';
    throw err;
  }

  return post;
};

const addOnPostsCategories = async (categoriesIds, postId) => {
  await checkCategoriesId(categoriesIds);

  categoriesIds.forEach(async (categoryId) => {
    await PostCategory.create({ postId, categoryId });
  });
};

const addPostService = async ({ title, content, categoryIds, id: userId }) => {
  checkPostData({ title, content, categoryIds });

  const { dataValues: { id } } = await BlogPost
  .create({ title, content, userId });

  await addOnPostsCategories(categoryIds, id);

  return { title, content, userId, id };
};

const getAllPostsService = async () => {
  const allPosts = await BlogPost.findAll({
    include: [
      { model: User, as: 'user' },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });

  return allPosts;
};

const getPostByIdService = async (postId) => {
  checkPostId(postId);

  const post = await BlogPost.findOne({
    where: { id: postId },
    include: [
      { model: User, as: 'user' },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });

  if (post === null) throwNotFound();

  return post;
};

const editPostService = async (postId, { title, content, categoryIds = null, user }) => {
  checkEditData({ title, content }, categoryIds);

  const post = await checkUserAuth(postId, user.id);
  await post.update({ title, content });

  return post;
};

const deletePostService = async (postId, userId) => {
  const post = await checkUserAuth(postId, userId);
  await post.destroy();
};

const getPostsByQueryService = async (query) => {
  const posts = await BlogPost.findAll({
    where: {
      [Op.or]: [
        { title: { [Op.substring]: query } },
        { content: { [Op.substring]: query } },
      ],
    },
    include: [
      { model: User, as: 'user' },
      { model: Category, as: 'categories', through: { attributes: [] } },
    ],
  });

  return posts;
};

module.exports = {
  addPostService,
  getAllPostsService,
  getPostByIdService,
  editPostService,
  deletePostService,
  getPostsByQueryService,
};
