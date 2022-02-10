const express = require('express');
const bodyParser = require('body-parser');
const usersRouter = require('../router/usersRouter');
const loginRouter = require('../router/loginRouter');
const categoriesRouter = require('../router/categoriesRouter');
const postsRouter = require('../router/postsRouter');

const app = express();

const port = process.env.PORT || 3000;

app.use(bodyParser.json());

// não remova esse endpoint, e para o avaliador funcionar
app.get('/', (request, response) => {
  response.send();
});

app.use('/user', usersRouter);

app.use('/login', loginRouter);

app.use('/categories', categoriesRouter);

app.use('/post', postsRouter);

app.listen(port, () => console.log(`ouvindo porta ${port}!`));
