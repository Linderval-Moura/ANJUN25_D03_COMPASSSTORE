<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

# ANJUN25\_D03\_COMPASSSTORE: API de Uploads com AWS

## Descrição do Projeto

Este projeto é uma API RESTful desenvolvida com **NestJS** e **TypeScript** que permite aos usuários se registrarem, fazerem login e gerenciarem uploads de imagens. Todas as imagens são armazenadas no **Amazon S3**, enquanto os metadados são salvos no **Amazon DynamoDB**. A aplicação foi projetada com foco em performance e escalabilidade.

## Funcionalidades Principais

  * **Autenticação de Usuário**:
      * **Cadastro**: Criação de novos usuários com nome, e-mail e senha.
      * **Login**: Autenticação de usuários, retornando um token **JWT** para acesso seguro às rotas.
  * **Gerenciamento de Imagens**:
      * **Upload de Imagens**: Permite o upload de arquivos `jpg`, `jpeg`, `png` e `webp` para um bucket do S3.
      * **Listagem de Imagens**: Lista todas as imagens do usuário autenticado, com suporte a busca por nome e paginação.
      * **Exclusão de Imagens**: Deleta uma imagem tanto do S3 quanto do DynamoDB, garantindo que apenas o proprietário possa fazer a exclusão.
      * **Exportação de Dados**: Gera e exporta um arquivo CSV com o nome, URL remota e data de criação das imagens do usuário.

## Tecnologias e Ferramentas

  * **Framework**: [NestJS](https://nestjs.com/)
  * **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
  * **Banco de Dados**: [Amazon DynamoDB](https://aws.amazon.com/dynamodb/)
  * **Armazenamento de Arquivos**: [Amazon S3](https://aws.amazon.com/s3/)

## Instalação e Configuração

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

  * [Node.js](https://nodejs.org/) (versão 18.x ou superior)
  * [npm](https://www.npmjs.com/)
  * [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)

### Passo a Passo

1.  Clone o repositório:

    ```bash
    $ git clone https://github.com/SEU_USUARIO/ANJUN25_D03_COMPASSSTORE.git
    $ cd ANJUN25_D03_COMPASSSTORE
    ```

2.  Instale as dependências:

    ```bash
    $ npm install
    ```

3.  Configure as variáveis de ambiente:

      * Copie o arquivo de exemplo e preencha os valores (o arquivo .dockerignore já está configurado para proteger seu .env):

    <!-- end list -->

    ```env
    PORT=3000 # Ou a que desejar

    DATABASE_URL=sua_URL_DynamoDB # OU     
    DATABASE_URL=http://dynamodb-local:8000 # para comunicação interna Docker.

    PROVIDER_ACCESS_KEY_ID=sua_chave_de_acesso
    PROVIDER_SECRET_ACCESS_KEY=sua_chave_de_acesso_secreta
    AWS_REGION=
    
    S3_ENDPOINT=http://localstack:4566 #docker s3 da aws

    S3_ASSET_URL=http://localhost:4566 #para desenvolvimento local.

    # Na AWS, o padrão é https://nome-do-bucket.s3.amazonaws.com
    #S3_ASSET_URL=https://nome-do-seu-bucket-real.s3.amazonaws.com
    PROVIDER_BUCKET=nome-do-seu-bucket-s3

    AWS_SESSION_TOKEN=
    JWT_SECRET=sua_chave_secreta_longa_e_unica
    ```

4.  Configure as tabelas do DynamoDB e o bucket do S3:

      * Crie as tabelas `Users` e `Images` com os índices necessários no console da AWS.
      * Crie um bucket no S3 e configure a política de acesso público (somente leitura).

### Executando o Projeto

Para rodar o projeto em modo de desenvolvimento (com auto-reload):

```bash
# Modo de desenvolvimento com auto-reload
$ npm run start:dev
```

Se você quiser usar os provedores de mock (sem conexão com a AWS), execute:

```bash
# Modo de desenvolvimento com mocks da AWS
$ npm run start:local
```

## Docker

Para rodar a aplicação em um container Docker, siga os passos abaixo:

### Pré-requisito

Certifique-se de ter o [Docker](https://www.docker.com/products/docker-desktop/) instalado em sua máquina.

### Passo a Passo

1.  **Construa a imagem Docker:**
    Este comando irá compilar o `Dockerfile` e criar uma imagem com o nome `anjun25-compassstore`.
    ```bash
    $ npm run docker:build
    ```
2.  **Subir Infraestrutura (Docker):**
    Este comando inicia a API, o DynamoDB Local e o LocalStack (S3):
    ```bash
    $ docker compose up -d
    ```
    Sua API estará acessível em `http://localhost:3000` ou no que definiu na variável PORT em .env.

3.  **Configuração Inicial dos Serviços:**
    Como o ambiente local é efêmero, você deve criar o bucket e a tabela manualmente na primeira execução.

    * Criar Bucket no S3 (LocalStack):
    ```bash
    $ docker exec -it localstack-s3 awslocal s3 mb s3://seu-bucket-name
    ```
    Criar Tabela Images com GSI (DynamoDB): 

    * Este comando cria a tabela com a chave primária e o índice userId-name-index necessário para deleção:
    ```bash
    $ aws dynamodb create-table \
    --endpoint-url http://localhost:8000 \
    --table-name Images \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=createdAt,AttributeType=S \
        AttributeName=name,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=createdAt,KeyType=RANGE \
    --global-secondary-indexes \
        "[{\"IndexName\": \"userId-name-index\", \"KeySchema\": [{\"AttributeName\": \"userId\", \"KeyType\": \"HASH\"}, {\"AttributeName\": \"name\", \"KeyType\": \"RANGE\"}], \"Projection\": {\"ProjectionType\": \"ALL\"}, \"ProvisionedThroughput\": {\"ReadCapacityUnits\": 5, \"WriteCapacityUnits\": 5}}]" \
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
    ```


## Rotas da API

Para testar a aplicação, use o [Insomnia](https://insomnia.rest/download) ou o [Postman](https://www.postman.com/downloads/).

  * `POST /auth/register`: Cadastro de usuário
  * `POST /auth/login`: Login e obtenção do token JWT
  * `POST /images/upload`: Upload de imagem (requer JWT)
  * `GET /images`: Listar imagens do usuário (requer JWT)
  * `GET /images?name=...`: Buscar imagens por nome (requer JWT)
  * `DELETE /images/:name`: Deletar imagem (requer JWT)
  * `GET /images/export`: Exportar dados para CSV (requer JWT)

## Testes

O projeto exige uma cobertura de 90% de testes unitários. Para rodar os testes, use:

```bash
# Rodar todos os testes
$ npm run test

# Testes com cobertura
$ npm run test:cov
```

## Licença

Este projeto está sob a licença MIT.