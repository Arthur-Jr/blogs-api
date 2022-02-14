const frisby = require('frisby');
const shell = require('shelljs');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const URL = `http://localhost:${PORT}`;

const {
  BAD_REQUEST,
  CREATED,
  UNAUTHORIZED,
  HTTP_OK_STATUS,
} = require('../utils/httpStatus');

describe('Testes da rota de categories.', () => {
  let response;
  let tokenResponse;

  const user = { displayName: 'Lewis Hamilton', email: 'lewishamilton@gmail.com', password: '123456' }

  beforeAll(async () => {
    tokenResponse = await frisby.post(`${URL}/login`, { email: user.email, password: user.password });
  });

  describe('Testes do endpoint POST /categories', () => {
    it('Será testado que é possivel cadastrar uma categoria com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/categories`, { name: 'Música' });

      expect(response.status).toBe(CREATED);
      expect(response.json).toHaveProperty('id');
      expect(response.json.id).toBe(3);
    });
  
    it('Será testado que não é possivel cadastrar uma categoria sem o campo name', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/categories`);

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"name" is required');
    });
  
    it('Será testado que não é possível cadastrar uma categoria sem o token', async () => {
      response = await frisby.post(`${URL}/categories`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será validado que não é possível cadastrar uma categoria com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/categories`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  });

  describe('Testes do endpoint GET /categories', () => {  
    it('Será testado que é possível listar todas as categorias com sucesso', async () => {  
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/categories`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json[0].id).toBe(1);
      expect(response.json[0].name).toBe('Inovação');
      expect(response.json[1].id).toBe(2);
      expect(response.json[1].name).toBe('Escola');
      expect(response.json[2].id).toBe(3);
      expect(response.json[2].name).toBe('Música');
    });
  
    it('Será testado que não é possível listar as categorias sem o token', async () => {
      response = await frisby.get(`${URL}/categories`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não é possível listar as categorias com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/categories`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  });
});
