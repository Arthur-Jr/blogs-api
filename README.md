# Projeto Blogs API

# Contexto
Esse projeto trata-se de uma API onde deverá ser possível fazer o cadastro e login de pessoas usuárias,
onde essas pessoas poderão fazer posts, modifica-los ou deleta-los. 

## Técnologias usadas

Back-end:
> Desenvolvido usando: NodeJS, ExpressJS, MySQL(sequelize), ES6, JWT, JEST(teste de integração), bcrypt.

## Instalando Dependências

> Backend

Na raiz do projeto:
```bash
npm install
``` 
## Executando aplicação

É necessário renomeear o arquivo .env.dev para .env.

Ainda no arquivo .env é necessário colocar o usuário e a senha do mysql assim como a porta que aplicação ira rodar.

* É necessário que o MySQL esteja ativo.

  Para checar o status do MySQL
    ```
    sudo systemctl status mysql
    ```
  Para iniciar o MySQL
    ```
    sudo systemctl start mysql
    ```
 
* Iniciando a aplicação
    ```
    npm start
    ```

## Executando Testes

* Para rodar todos os testes:

  ```
    npm test
  ```
