const express = require('express');
const errorMiddleware = require('../middlewares/errorMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  addPostController,
  getAllPostsController,
  getPostByIdController,
  editPostController,
  deletePostController,
  getPostsByQueryController,
} = require('../controller/post.controller');

const router = express.Router();

router.use(authMiddleware);

router.get('/search?', getPostsByQueryController);

router.post('/', addPostController);

router.get('/', getAllPostsController);

router.get('/:id', getPostByIdController);

router.put('/:id', editPostController);

router.delete('/:id', deletePostController);

router.use(errorMiddleware);

module.exports = router;
