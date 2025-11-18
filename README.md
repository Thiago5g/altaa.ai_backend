# ALTAA Backend<p align="center">

  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>

API REST para gerenciamento de empresas, usuários e convites, construída com NestJS, Prisma e PostgreSQL.</p>



## 🚀 Tecnologias[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

- **[NestJS](https://nestjs.com/)** - Framework Node.js progressivo para construção de aplicações server-side

- **[Prisma ORM](https://www.prisma.io/)** - ORM moderno para TypeScript e Node.js  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional (via Supabase)    <p align="center">

- **[JWT](https://jwt.io/)** - Autenticação baseada em tokens<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>

- **[Bcrypt](https://www.npmjs.com/package/bcrypt)** - Hash de senhas<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>

- **[Swagger](https://swagger.io/)** - Documentação automática da API<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>

- **TypeScript** - Superset JavaScript com tipagem estática<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>

<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>

## 📋 Features<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>

<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>

### Autenticação  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>

- ✅ Cadastro de usuários com hash de senha (bcrypt)    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>

- ✅ Login com geração de token JWT  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>

- ✅ Proteção de rotas com Guards JWT</p>

- ✅ Decorator customizado para extrair userId do token  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)

  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

### Gerenciamento de Empresas

- ✅ Criar nova empresa (automaticamente cria membership para o criador como ADMIN)## Description

- ✅ Listar empresas do usuário logado

- ✅ Selecionar empresa ativa[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

- ✅ Listar membros de uma empresa

- ✅ Enviar convites para novos membros (por e-mail)## Project setup



### Sistema de Convites```bash

- ✅ Listar convites pendentes do usuário logado$ npm install

- ✅ Aceitar convite (cria membership automaticamente)```

- ✅ Recusar convite (remove da base)

- ✅ Validação de duplicidade de convites## Compile and run the project

- ✅ Controle de status (pendente, aceito, recusado)

```bash

### Roles e Permissões# development

- ✅ ADMIN - Controle total da empresa$ npm run start

- ✅ MEMBER - Acesso básico

- ✅ Sistema de roles via enum Prisma# watch mode

$ npm run start:dev

## 🗃️ Estrutura do Banco de Dados

# production mode

```prisma$ npm run start:prod

model User {```

  id           String       @id @default(cuid())

  email        String       @unique## Run tests

  name         String

  passwordHash String```bash

  createdAt    DateTime     @default(now())# unit tests

  memberships  Membership[]$ npm run test

}

# e2e tests

model Company {$ npm run test:e2e

  id          String       @id @default(cuid())

  name        String# test coverage

  createdAt   DateTime     @default(now())$ npm run test:cov

  memberships Membership[]```

  invites     Invite[]

}## Deployment



model Membership {When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

  id        String   @id @default(cuid())

  userId    StringIf you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

  companyId String

  role      Role     @default(MEMBER)```bash

  createdAt DateTime @default(now())$ npm install -g @nestjs/mau

  user      User     @relation(...)$ mau deploy

  company   Company  @relation(...)```

}

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

model Invite {

  id         String    @id @default(cuid())## Resources

  email      String

  companyId  StringCheck out a few resources that may come in handy when working with NestJS:

  role       Role      @default(MEMBER)

  acceptedAt DateTime?- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

  declinedAt DateTime?- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).

  createdAt  DateTime  @default(now())- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).

  company    Company   @relation(...)- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.

}- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).

- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).

enum Role {- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).

  ADMIN- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

  MEMBER

}## Support

```

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## 🔧 Configuração

## Stay in touch

### 1. Pré-requisitos

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)

- Node.js 20+- Website - [https://nestjs.com](https://nestjs.com/)

- npm ou yarn- Twitter - [@nestframework](https://twitter.com/nestframework)

- PostgreSQL (ou conta no Supabase)

## License

### 2. Instalação

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

```bash
# Instalar dependências
npm install
```

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Database
DATABASE_URL="postgresql://usuario:senha@host:5432/database?schema=public"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura"

# Server
PORT=3001
```

### 4. Configurar Banco de Dados

```bash
# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev

# (Opcional) Abrir Prisma Studio para visualizar dados
npm run prisma:studio
```

## 🚀 Como Rodar

### Desenvolvimento

```bash
# Modo watch (recarrega automaticamente)
npm run start:dev
```

O servidor estará disponível em `http://localhost:3001`

### Produção

```bash
# Build
npm run build

# Start
npm run start:prod
```

### Outros Comandos

```bash
# Linter
npm run lint

# Formatação de código
npm run format

# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura de testes
npm run test:cov
```

## 📚 Documentação da API

A documentação Swagger está disponível em:

```
http://localhost:3001/api
```

### Principais Endpoints

#### Autenticação
- `POST /auth/signup` - Cadastrar novo usuário
- `POST /auth/signin` - Fazer login
- `POST /auth/accept-invite/:inviteId` - Aceitar convite e criar conta

#### Empresas
- `GET /companies` - Listar empresas do usuário
- `POST /companies` - Criar nova empresa
- `POST /companies/:id/select` - Selecionar empresa ativa
- `GET /companies/:id/members` - Listar membros
- `POST /companies/:id/invite` - Enviar convite

#### Convites
- `GET /invites/pending` - Listar convites pendentes
- `POST /invites/:id/accept` - Aceitar convite
- `POST /invites/:id/decline` - Recusar convite

## 🏗️ Estrutura do Projeto

```
src/
├── auth/                 # Módulo de autenticação
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   └── jwt-auth.guard.ts
├── companies/            # Módulo de empresas
│   ├── companies.controller.ts
│   ├── companies.service.ts
│   └── dto/
├── invites/              # Módulo de convites
│   ├── invites.controller.ts
│   └── invites.service.ts
├── prisma/               # Configuração Prisma
│   └── prisma.service.ts
├── common/               # Utilitários compartilhados
│   └── user.decorator.ts
└── main.ts              # Entry point
```

## 🔐 Autenticação

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <seu-token-jwt>
```

Exemplo com cURL:

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3001/companies
```

## 🛠️ CI/CD

O projeto inclui GitHub Actions para:
- ✅ Build automático em push/PR
- ✅ Validação do código TypeScript
- ✅ Execução em Node.js 20

## 📄 Licença

Este projeto é privado e não possui licença pública.
