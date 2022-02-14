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

describe('Testes da rota de posts.', () => {
  let response;
  let tokenResponse;
  let invalidTokenResponse;

  const user = { displayName: 'Lewis Hamilton', email: 'lewishamilton@gmail.com', password: '123456' };

  beforeAll(async () => {
    tokenResponse = await frisby.post(`${URL}/login`, { email: user.email, password: user.password });

    invalidTokenResponse = await frisby.post(`${URL}/login`, { email: 'MichaelSchumacher@gmail.com', password: '123456' });
  });

  describe('Testes do endpoint POST /post', () => {  
    it('Será testado que é possível cadastrar um blogpost com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/post`, {
        title: 'Fórmula 1',
        content: 'O campeão do ano!',
        categoryIds: [1],
      });

      expect(response.status).toBe(CREATED);
      expect(response.json).toHaveProperty('id');
      expect(response.json.id).toBe(3);
      expect(response.json.title).toBe('Fórmula 1');
      expect(response.json.userId).toBe(1);
    });
  
    it('Será testado que não é possível cadastrar um blogpost sem o campo `title`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/post`, {
        content: 'O campeão do ano!',
        categoryIds: [1],
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"title" is required');
    });
  
    it('Será testado que não é possível cadastrar um blogpost sem o campo `content`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/post`, {
        title: 'Fórmula 1',
        categoryIds: [1],
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"content" is required');
    });
  
    it('Será testado que não é possível cadastrar um blogpost sem o campo `categoryIds`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/post`, {
        title: 'Fórmula 1',
        content: 'O campeão do ano!',
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"categoryIds" is required');
    });
  
    it('Será testado que não é possível cadastrar um blogpost com uma categoria inexistente', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/post`, {
        title: 'Fórmula 1',
        content: 'O campeão do ano!',
        categoryIds: [10],
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"categoryIds" not found');
    });
  
    it('Será testado que não é possível cadastrar um blogpost sem o token', async () => {
      response = await frisby.post(`${URL}/post`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não é possível cadastrar um blogpost com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).post(`${URL}/post`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  });

  describe('Teste do endpoint GET /post', () => {
    it('Será testado que é possível listar blogpost com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json[0]).toHaveProperty('id');
      expect(response.json[0].id).toBe(1);
      expect(response.json[0]).toHaveProperty('user');
      expect(response.json[0]).toHaveProperty('categories');
    });
  
    it('Será testado que não é possível listar blogpost sem token', async () => {
      response = await frisby.get(`${URL}/post`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não é possível listar blogpost com token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  });

  describe('Teste do endpoint GET post/:id', () => {  
    it('Será testado que é possível listar um blogpost com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/1`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json).toHaveProperty('id');
      expect(response.json.id).toBe(1);
      expect(response.json).toHaveProperty('user');
      expect(response.json).toHaveProperty('categories');
    });
  
    it('Será testado que não é possível listar um blogpost sem token', async () => {
      response = await frisby.get(`${URL}/post/1`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não é possível listar um blogpost com token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/1`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  
    it('Será testado que não é possível listar um blogpost inexistente', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/10`);

      expect(response.status).toBe(NOT_FOUND);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Post does not exist');
    });
  });

  describe('Testes do endpoint PUT /post/:id', () => {
    it('Será testado que é possível editar um blogpost com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).put(`${URL}/post/3`, {
        title: 'Fórmula 1 editado',
        content: 'O campeão do ano! editado',
      });

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json).toHaveProperty('userId');
      expect(response.json).toHaveProperty('categories');
      expect(response.json.userId).toBe(1);
      expect(response.json.title).toBe('Fórmula 1 editado');
      expect(response.json.content).toBe('O campeão do ano! editado');
    });
  
    it('Será testado que é não é possível editar as categorias de um blogpost', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).put(`${URL}/post/3`, {
        title: 'Fórmula 1 editado',
        content: 'O campeão do ano! editado',
        categoryIds: [1, 2]
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Categories cannot be edited');
    });
  
    it('Será testado que não é possível editar um blogpost com outro usuário', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: invalidTokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).put(`${URL}/post/3`, {
        title: 'Fórmula 1 editado',
        content: 'O campeão do ano! editado',
      });

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Unauthorized user');
    });
  
    it('Será testado que não possível editar um blogpost sem token', async () => {
      response = await frisby.put(`${URL}/post/3`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não possível editar um blogpost com token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).put(`${URL}/post/3`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  
    it('Será testado que não possível editar um blogpost sem o campo `title`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).put(`${URL}/post/3`, {
        content: 'O campeão do ano! editado',
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"title" is required');
    });
  
    it('Será testado que não possível editar um blogpost sem o campo `content`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).put(`${URL}/post/3`, {
        title: 'Fórmula 1 editado',
      });

      expect(response.status).toBe(BAD_REQUEST);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('"content" is required');
    });
  });

  describe('Teste do endpoint DELETE `post/:id`', () => {  
    it('Será testado que é possível deletar um blogpost com sucesso', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).delete(`${URL}/post/3`);

      expect(response.status).toBe(NO_CONTENT);
    });
  
    it('Será testado que não é possível deletar um blogpost com outro usuário', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: invalidTokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).delete(`${URL}/post/1`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Unauthorized user');
    });
  
    it('Será testado que não é possível deletar um blogpost inexistente', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).delete(`${URL}/post/10`);

      expect(response.status).toBe(NOT_FOUND);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Post does not exist');
    });
  
    it('Será testado que não é possível deletar um blogpost sem o token', async () => {
      response = await frisby.delete(`${URL}/post/3`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não é possível deletar um blogpost com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).delete(`${URL}/post/3`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  });

  describe('Testes do endpoint GET /post/search?q=:searchTerm', () => {  
    it('Será testado que é possível buscar um blogpost pelo `title`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/search?q=Vamos que vamos`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json[0].id).toBe(2);
      expect(response.json[0].title).toBe('Vamos que vamos');
      expect(response.json[0]).toHaveProperty('user');
      expect(response.json[0]).toHaveProperty('categories');
    });
  
    it('Será testado que é possível buscar um blogpost pelo `content`', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/search?q=Foguete não tem ré`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json[0].id).toBe(2);
      expect(response.json[0].content).toBe('Foguete não tem ré');
      expect(response.json[0].title).toBe('Vamos que vamos');
      expect(response.json[0]).toHaveProperty('user');
      expect(response.json[0]).toHaveProperty('categories');
    });
  
    it('Será testado que é possível buscar todos os blogpost quando passa a busca vazia', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/search?q=`);

      expect(response.status).toBe(HTTP_OK_STATUS);
      expect(response.json).toHaveLength(3);

      expect(response.json[0].title).toBe('Post do Ano');
      expect(response.json[0].id).toBe(1);
      expect(response.json[0]).toHaveProperty('user');
      expect(response.json[0]).toHaveProperty('categories');

      expect(response.json[1].title).toBe('Vamos que vamos');
      expect(response.json[1].id).toBe(2);
      expect(response.json[1]).toHaveProperty('user');
      expect(response.json[1]).toHaveProperty('categories');
    });
  
    it('Será testado que é possível buscar um blogpost inexistente e retornar array vazio', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: tokenResponse.json.token, 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/search?q=Não existe`);

      expect(response.json).toHaveLength(0);
    });
  
    it('Será testado que não é possível buscar um blogpost sem o token', async () => {
      response = await frisby.get(`${URL}/post/search?q=Vamos que vamos`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Token not found');
    });
  
    it('Será testado que não é possível buscar um blogpost com o token inválido', async () => {
      response = await frisby.setup({
        request: {
          headers: { authorization: '12345', 'Content-Type': 'application/json' }
        }
      }).get(`${URL}/post/search?q=Vamos que vamos`);

      expect(response.status).toBe(UNAUTHORIZED);
      expect(response.json).toHaveProperty('message');
      expect(response.json.message).toBe('Expired or invalid token');
    });
  });
});
