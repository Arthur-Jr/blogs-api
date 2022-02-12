const frisby = require('frisby');
const shell = require('shelljs');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const URL = `http://localhost:${PORT}`;

const {
  BAD_REQUEST,
  CONFLICT,
  CREATED,
  UNAUTHORIZED,
  HTTP_OK_STATUS,
  NOT_FOUND,
  NO_CONTENT,
} = require('../utils/httpStatus');

describe('Testes da rota de user.', () => {
  let response;
  let tokenResponse;

  const newUser = { displayName: 'displayTest', email: 'test@email.com', password: '123456' };
  const oldUser = { displayName: 'Michael Schumacher', email: 'MichaelSchumacher@gmail.com', password: '123456' }

  beforeAll(() => {
    shell.exec('npx sequelize-cli db:drop');
    shell.exec('npx sequelize-cli db:create && npx sequelize-cli db:migrate');
    shell.exec('npx sequelize-cli db:seed:all');
  });
  
  describe('Testes de cadastro de usuário. "POST /user"', () => {
    describe('Testes do campo "displayName".', () => {
      it('Será validado que o campo "displayName" é obrigatório', async () => {
        response = await frisby.post(`${URL}/user`, { ...newUser, displayName: undefined });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('"displayName" is required');
      });

      it('Será testado que não é possível cadastrar usuário com o campo "displayName" menor que 8 caracteres', async () => {
        response = await frisby.post(`${URL}/user`, { ...newUser, displayName: 'test' });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('"displayName" length must be at least 8 characters long');
      });
    });

    describe('Testes do campo "email"', () => {
      it('Será testado que não é possível cadastrar usuário com o campo "email" com formato invalido', async () => {
        response = await frisby.post(`${URL}/user`, { ...newUser, email: 'test@123' });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('"email" must be a valid email');
      });

      it('Será validado que o campo "email" é obrigatório', async () => {
        response = await frisby.post(`${URL}/user`, { ...newUser, email: undefined });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('"email" is required');
      });
    });

    describe('Testes do campo "password"', () => {
      it('Será testado que não é possível cadastrar usuário com o campo "password" não tiver 6 characters', async () => {
        response = await frisby.post(`${URL}/user`, { ...newUser, password: '1234' });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('"password" length must be 6 characters long');
      });

      it('Será testado que o campo "password" é obrigatório', async () => {
        response = await frisby.post(`${URL}/user`, { ...newUser, password: undefined });

        expect(response.status).toBe(BAD_REQUEST);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('"password" is required');
      });
    });

    describe('Teste de duplicidade de email', () => {
      it('Testar que não é possível cadastrar um usuário com email já cadatrado', async () => {
        response = await frisby.post(`${URL}/user`, oldUser);

        expect(response.status).toBe(CONFLICT);
        expect(response.json).toHaveProperty('message');
        expect(response.json.message).toEqual('User already registered');
      });
    });

    describe('Teste se é possivel cadastrar o usuário', () => {
      it('Será testado que é possível cadastrar um usuário com sucesso', async () => {
        response = await frisby.post(`${URL}/user`, newUser);

        expect(response.status).toBe(CREATED);
        expect(response.json).toHaveProperty('token');
      });
    });
  });

  describe('Testes de listagem de usuários. "GET /user"', () => {
    beforeAll(async () => {
      tokenResponse = await frisby.post(`${URL}/login`, { email: oldUser.email, password: oldUser.password });
    })

    it('Será testado que não é possível listar usuários sem o token na requisição', async () => {
      response = await frisby.get(`${URL}/user`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('Token not found');
    });

    it('Será testado que não é possível listar usuários com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/user`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('Expired or invalid token');
    });

    it('Será testado que é possível listar todos os usuários', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/user`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json).toHaveLength(3);
    });
  });

  describe('Teste do GET /user/:id', () => {
    it('Será testado que não é possível listar um determinado usuário sem o token na requisição', async () => {
      response = await frisby.get(`${URL}/user/1`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('Token not found');
    });

    it('Será testado que não é possível listar um determinado usuário com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/user/1`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('Expired or invalid token');
    });

    it('Será testado que não é possível listar um usuário inexistente', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/user/10`);

      expect(response.status).toBe(NOT_FOUND);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('User does not exist');
    });

    it('Será testado que é possível listar um usuário específico com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/user/1`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json).toHaveProperty('id');
      expect(response.json.id).toBe(1);
    });
  });

  describe('Testes do DELETE /user/me', () => {
    it('Será testado que não é possível excluir meu usuário sem o token', async () => {
      response = await frisby.delete(`${URL}/user/me`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('Token not found');
    });

    it('Será testado que não é possível excluir meu usuário com token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).delete(`${URL}/user/me`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toEqual('Expired or invalid token');
    });

    it('Será testatdo que é possível excluir meu usuário com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).delete(`${URL}/user/me`);

      expect(response.status).toBe(NO_CONTENT);
    });
  });
});
