const frisby = require('frisby');
const shell = require('shelljs');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const URL = `http://localhost:${PORT}`;

const {
  BAD_REQUEST,
  HTTP_OK_STATUS,
} = require('../utils/httpStatus');

describe('Testes da rota de login', () => {
  let response;

  const user = { displayName: 'Lewis Hamilton', email: 'lewishamilton@gmail.com', password: '123456' }

  it('Será testado que não é possível fazer login sem o campo email', async () => {
    response = await frisby.post(`${URL}/login`, { email: undefined, password: user.password });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.json).toHaveProperty('message');
    expect(response.json.message).toEqual('"email" is required');
  });

  it('Será testado que não é possível fazer login com o campo email em branco', async () => {
    response = await frisby.post(`${URL}/login`, { email: '', password: user.password });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.json).toHaveProperty('message');
    expect(response.json.message).toEqual('"email" is not allowed to be empty');
  });

  it('Será testado que não é possível fazer login sem o campo password', async () => {
    response = await frisby.post(`${URL}/login`, { email: user.email, password: undefined });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.json).toHaveProperty('message');
    expect(response.json.message).toEqual('"password" is required');
  });

  it('Será testado que não é possível fazer login com o campo password em branco', async () => {
    response = await frisby.post(`${URL}/login`, { email: user.email, password: '' });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.json).toHaveProperty('message');
    expect(response.json.message).toEqual('"password" is not allowed to be empty');
  });

  it('Será testado que não é possível fazer login com um usuário que não existe', async () => {
    response = await frisby.post(`${URL}/login`, { email: 'xablau@email.com', password: '123456' });

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.json).toHaveProperty('message');
    expect(response.json.message).toEqual('Invalid fields');
  });

  it('Será testado que é possível fazer login com sucesso', async () => {
    response = await frisby.post(`${URL}/login`, { email: user.email, password: user.password });
    
    expect(response.status).toBe(HTTP_OK_STATUS);
    expect(response.json).toHaveProperty('token');
  });
});
