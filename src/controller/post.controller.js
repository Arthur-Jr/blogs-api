const rescue = require('express-rescue');
const { CREATED, HTTP_OK_STATUS, NO_CONTENT } = require('../utils/httpStatus');
const {
  addPostService,
  getAllPostsService,
  getPostByIdService,
  editPostService,
  deletePostService,
  getPostsByQueryService,
} = require('../service/post.service');

const addPostController = rescue(async (req, res) => {
  const { title, content, categoryIds, user: { id } } = req.body;

  const newPost = await addPostService({ title, content, categoryIds, id });

  return res.status(CREATED).json(newPost);
});

const getAllPostsController = rescue(async (_req, res) => {
  const allPosts = await getAllPostsService();

  return res.status(HTTP_OK_STATUS).json(allPosts);
});

const getPostByIdController = rescue(async (req, res) => {
  const { id } = req.params;

  const post = await getPostByIdService(id);

  return res.status(HTTP_OK_STATUS).json(post);
});

const editPostController = rescue(async (req, res) => {
  const { body, params: { id } } = req;

  const editedPost = await editPostService(id, body);

  return res.status(HTTP_OK_STATUS).json(editedPost);
});

const deletePostController = rescue(async (req, res) => {
  const { params: { id }, body: { user: { id: userId } } } = req;

  await deletePostService(id, userId);

  res.status(NO_CONTENT).send();
});

const getPostsByQueryController = rescue(async (req, res) => {
  const { q } = req.query;
  console.log(q);

  const posts = await getPostsByQueryService(q);

  return res.status(HTTP_OK_STATUS).json(posts);
});

module.exports = {
  addPostController,
  getAllPostsController,
  getPostByIdController,
  editPostController,
  deletePostController,
  getPostsByQueryController,
};
