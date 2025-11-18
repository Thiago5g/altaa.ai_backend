# Testes Unitários - Backend

## Sumário Executivo

O backend possui **85 testes unitários** distribuídos em **10 suites de teste**, cobrindo todos os principais repositórios, serviços e controllers da aplicação. Todos os testes estão passando e integrados ao pipeline de CI/CD.

A arquitetura segue o **Repository Pattern** com 3 camadas:
```
Controller → Service → Repository → PrismaService
```

## Execução dos Testes

### Comandos Disponíveis

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch (desenvolvimento)
npm run test:watch

# Executar testes com cobertura de código
npm run test:cov

# Executar teste de módulo específico
npm test -- auth
npm test -- companies
npm test -- invites
```

### Resultados

```
Test Suites: 10 passed, 10 total
Tests:       85 passed, 85 total
Time:        ~5.3s
```

## Estrutura de Testes

A aplicação segue o **Repository Pattern**, com testes organizados em 3 camadas:

1. **Repositories** (42 testes): Testam acesso ao banco de dados
2. **Services** (26 testes): Testam lógica de negócio
3. **Controllers** (16 testes): Testam roteamento HTTP

### Resumo por Módulo

| Módulo | Repository | Service | Controller | Total |
|--------|------------|---------|------------|-------|
| Auth | 13 | 6 | 4 | 23 |
| Companies | 8 | 11 | 7 | 26 |
| Invites | 21 | 9 | 4 | 34 |
| App | - | - | 1 | 1 |
| **Total** | **42** | **26** | **16** | **85** |

---

## Módulo Auth (23 testes)

### 1. AuthRepository (13 testes)

**Arquivo**: `src/auth/repository/auth.repository.spec.ts`

#### Cobertura

- ✅ Definição do repositório
- ✅ Operações CRUD de usuário:
  - countUsersByEmail
  - createUser
  - findUserByEmail (success + null)
  - findUserById (success + null)
- ✅ Operações de convite:
  - findInviteByToken (success + null)
  - markInviteAsAccepted
- ✅ Operações de membership:
  - findMembershipByUserAndCompany (success + null)
  - createMembership
- ✅ Operações de empresa ativa:
  - findUserActiveCompanyId (success + null)
  - updateUserActiveCompany
- ✅ Transações:
  - executeInTransaction

#### Técnicas Utilizadas

- **Mocking de PrismaService**: Mock de todas as operações do Prisma
- **Testes de transações**: Mock de $transaction com callback
- **Testes de null**: Verificação de casos onde entidade não existe
- **Type Safety**: Uso de generics para tipagem do Jest

### 2. AuthService (6 testes)

**Arquivo**: `src/auth/service/auth.service.spec.ts`

#### Cobertura

- ✅ Definição do serviço
- ✅ Cadastro (signup)
  - Criação de usuário com sucesso
  - Erro ao tentar cadastrar email duplicado
- ✅ Login (signin)
  - Login com sucesso
  - Erro quando usuário não existe
  - Erro quando senha está incorreta

#### Técnicas Utilizadas

- **Mocking de bcrypt**: Mock completo do módulo bcrypt para controlar hash e compare
- **Mocking de AuthRepository**: Mock de countUsersByEmail, createUser, findUserByEmail
- **Mocking de JwtService**: Mock de signAsync para geração de token
- **Testes de exceções**: ConflictException, UnauthorizedException

### 3. AuthController (4 testes)

**Arquivo**: `src/auth/controller/auth.controller.spec.ts`

#### Cobertura

- ✅ Definição do controller
- ✅ POST /auth/signup - Chama authService.signup com DTO
- ✅ POST /auth/signin - Chama authService.signin com DTO
- ✅ POST /auth/accept-invite - Chama authService.acceptInvite com userId e DTO

#### Técnicas Utilizadas

- **Mocking de AuthService**: Mock dos métodos signup, signin, acceptInvite
- **Validação de chamadas**: Verificação de que o service é chamado com parâmetros corretos
- **Testes de controller puro**: Sem guards, focado na lógica de roteamento

---

## Módulo Companies (26 testes)

### 4. CompaniesRepository (8 testes)

**Arquivo**: `src/companies/repository/companies.repository.spec.ts`

#### Cobertura

- ✅ Definição do repositório
- ✅ Operações de empresa:
  - createCompanyWithMembership (com transação)
  - updateUserActiveCompany
- ✅ Operações de membership:
  - findMembershipsByUserId
  - countMembershipsByUserId
  - findMembershipByUserAndCompany
  - findMembershipsByCompanyId
- ✅ Operações de convite:
  - createInvite

#### Técnicas Utilizadas

- **Mocking de transações**: Mock complexo de $transaction com callback
- **Mocking de relacionamentos**: Mock de queries com includes
- **Testes de paginação**: Verificação de skip e take

### 5. CompaniesService (11 testes)

**Arquivo**: `src/companies/service/companies.service.spec.ts`

#### Cobertura

- ✅ Definição do serviço
- ✅ Criação de empresa (createCompany)
  - Criação de empresa e membership com transação
- ✅ Listagem de empresas (listCompanies)
  - Listagem paginada de empresas do usuário
- ✅ Convite para empresa (inviteToCompany)
  - Convite por OWNER
  - Convite por ADMIN
  - Erro quando usuário não é membro
  - Erro quando usuário é apenas MEMBER
- ✅ Seleção de empresa ativa (selectActiveCompany)
  - Atualização de empresa ativa com sucesso
  - Erro quando usuário não é membro
- ✅ Listagem de membros (listMembers)
  - Listagem de membros da empresa
  - Erro quando usuário não é membro

#### Técnicas Utilizadas

- **Mocking de CompaniesRepository**: Mock de todos os 7 métodos do repositório
- **Testes de autorização**: ForbiddenException baseado em roles
- **Testes de business logic**: Validação de regras de negócio sem acesso ao banco
- **Testes de casos de erro**: NotFoundException e ForbiddenException

### 6. CompaniesController (7 testes)

**Arquivo**: `src/companies/controller/companies.controller.spec.ts`

#### Cobertura

- ✅ Definição do controller
- ✅ POST /companies - Criação de empresa
- ✅ GET /companies - Listagem com paginação padrão
- ✅ POST /companies/:id/invite - Convite para empresa
- ✅ POST /companies/:id/select - Seleção de empresa ativa
- ✅ GET /companies/:id/members - Listagem de membros

#### Técnicas Utilizadas

- **Mocking de CompaniesService**: Mock de todos os métodos do service
- **Testes de parâmetros opcionais**: Validação de valores padrão vs customizados
- **Testes de roteamento com params**: Verificação de :id params
- **Testes de query params**: Verificação de page e pageSize

---

## Módulo Invites (34 testes)

### 7. InvitesRepository (21 testes)

**Arquivo**: `src/invites/repository/invites.repository.spec.ts`

#### Cobertura

- ✅ Definição do repositório
- ✅ Operações de convite:
  - findPendingInvitesByEmail
  - findInviteById (success + null)
  - markInviteAccepted
  - deleteInvite
- ✅ Operações de usuário:
  - findUserEmailById (success + null)
  - findUserByIdWithEmail (success + null)
  - findUserActiveCompanyId (success + null)
  - updateUserActiveCompany
- ✅ Operações de membership:
  - findMembershipByUserAndCompany (success + null)
  - createMembership
- ✅ Transações:
  - executeInTransaction

#### Técnicas Utilizadas

- **Mocking completo do Prisma**: Mock de invite, user, membership
- **Testes de relacionamentos**: Mock de queries com company select
- **Testes de transações**: Mock de callback transacional
- **Testes de null safety**: Verificação de casos não encontrados

### 8. InvitesService (9 testes)

**Arquivo**: `src/invites/service/invites.service.spec.ts`

#### Cobertura

- ✅ Definição do serviço
- ✅ Listagem de convites pendentes (listPending)
  - Listagem de convites para email do usuário
  - Erro quando usuário não existe
- ✅ Aceitação de convite (accept)
  - Aceitação e criação de membership
  - Erro quando usuário não existe
  - Erro quando convite não existe
  - Erro quando convite já foi aceito
  - Erro quando convite é para outro email
- ✅ Recusa de convite (decline)
  - Recusa e exclusão do convite
  - Erro quando usuário não existe
  - Erro quando convite não existe
  - Erro quando convite já foi aceito
  - Erro quando convite é para outro email

#### Técnicas Utilizadas

- **Mocking de InvitesRepository**: Mock de todos os métodos do repositório
- **Validação de email case-insensitive**: Testes de comparação de emails
- **Testes de estados**: Verificação de acceptedAt null vs data
- **Testes de transações**: Mock de executeInTransaction com callback complexo

### 9. InvitesController (4 testes)

**Arquivo**: `src/invites/controller/invites.controller.spec.ts`

#### Cobertura

- ✅ Definição do controller
- ✅ GET /invites/pending - Listagem de convites pendentes
- ✅ POST /invites/:id/accept - Aceitação de convite
- ✅ POST /invites/:id/decline - Recusa de convite

#### Técnicas Utilizadas

- **Mocking de InvitesService**: Mock dos métodos do service
- **Testes de roteamento RESTful**: Verificação de endpoints com :id
- **Validação de status literals**: Uso de 'as const' para tipos literais

---

## Módulo App (1 teste)

### 10. AppController (1 teste)

**Arquivo**: `src/app.controller.spec.ts`

#### Cobertura

- ✅ Endpoint GET / retorna "Hello World!"

---

## Arquitetura - Repository Pattern

### Estrutura de Camadas

```
┌─────────────────────────────────────────┐
│           HTTP Request                   │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          Controller Layer                │
│  - Recebe requisições HTTP               │
│  - Valida parâmetros e DTOs              │
│  - Chama métodos do Service              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│           Service Layer                  │
│  - Implementa lógica de negócio          │
│  - Valida regras de negócio              │
│  - Orquestra chamadas ao Repository      │
│  - Lança exceções de negócio             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Repository Layer                 │
│  - Abstrai acesso ao banco de dados      │
│  - Executa queries do Prisma             │
│  - Gerencia transações                   │
│  - Retorna entidades tipadas             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│          PrismaService                   │
│  - Cliente do Prisma ORM                 │
│  - Conexão com PostgreSQL                │
└─────────────────────────────────────────┘
```

### Benefícios do Repository Pattern

1. **Separação de Responsabilidades**
   - Controller: HTTP handling
   - Service: Business logic
   - Repository: Data access

2. **Testabilidade**
   - Services testados mockando Repositories (não PrismaService)
   - Repositories testados mockando PrismaService
   - Isolamento completo de dependências

3. **Manutenibilidade**
   - Mudanças no banco de dados isoladas nos Repositories
   - Services focados apenas em lógica de negócio
   - Código mais limpo e organizado

4. **Type Safety**
   - Interfaces explícitas para retornos de Repositories
   - TypeScript garante tipos corretos em toda a cadeia

### Exemplo Prático

```typescript
// 1. Controller recebe request
@Post()
async createCompany(
  @CurrentUserId() userId: string,
  @Body() dto: CreateCompanyDto
) {
  return this.companiesService.createCompany(userId, dto);
}

// 2. Service aplica regras de negócio
async createCompany(userId: string, dto: CreateCompanyDto) {
  // Lógica de negócio aqui
  return this.companiesRepository.createCompanyWithMembership(
    userId,
    { name: dto.name, logoUrl: dto.logoUrl }
  );
}

// 3. Repository executa query
async createCompanyWithMembership(userId: string, data: CreateCompanyData) {
  return this.prisma.$transaction(async (tx) => {
    const company = await tx.company.create({ data });
    await tx.membership.create({
      data: { userId, companyId: company.id, role: 'OWNER' }
    });
    return company;
  });
}
```

---

### Jest Configuration

O Jest está configurado no `package.json`:

```json
{
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.(t|j)s"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

### Dependências de Teste

- `@nestjs/testing` 11.0.1
- `jest` 30.0.0
- `ts-jest` 29.2.5
- `@types/jest` 30.0.0
- `@types/supertest` 6.0.2
- `supertest` 7.0.0

## Estratégias de Mock

### 1. Mocking de Repositories (nos testes de Services)

Todos os métodos do Repository são mockados:

```typescript
const mockCompaniesRepository = {
  createCompanyWithMembership: jest.fn(),
  findMembershipsByUserId: jest.fn(),
  countMembershipsByUserId: jest.fn(),
  findMembershipByUserAndCompany: jest.fn(),
  createInvite: jest.fn(),
  updateUserActiveCompany: jest.fn(),
  findMembershipsByCompanyId: jest.fn(),
};
```

### 2. Mocking de PrismaService (nos testes de Repositories)

Todos os métodos do Prisma são mockados:

```typescript
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  company: {
    create: jest.fn(),
  },
  membership: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
  },
  invite: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
};
```

### 3. Services em Controllers

Mock simples dos métodos de Service:

```typescript
const mockCompaniesService = {
  createCompany: jest.fn(),
  listCompanies: jest.fn(),
  inviteToCompany: jest.fn(),
  selectActiveCompany: jest.fn(),
  listMembers: jest.fn(),
};
```

### 4. JwtService

Mock simples para geração de tokens:

```typescript
const mockJwtService = {
  signAsync: jest.fn(),
};
```

### 5. bcrypt

Mock de módulo completo:

```typescript
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));
```

### 6. Transações do Prisma

Mock especial para $transaction:

```typescript
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
mockPrismaService.$transaction.mockImplementation(async (callback) => {
  const mockTx = {
    company: { create: jest.fn().mockResolvedValue(mockCompany) },
    membership: { create: jest.fn().mockResolvedValue({}) }
  };
  return callback(mockTx);
});
```

## Supressões de ESLint

Para evitar falsos positivos do ESLint em testes, utilizamos:

```typescript
/* eslint-disable @typescript-eslint/unbound-method */
```

Esta supressão é necessária porque o ESLint reclama de métodos separados de seus objetos (expect(...).toHaveBeenCalled), mas isso é o comportamento esperado do Jest.

## Integração com CI/CD

Os testes estão integrados ao GitHub Actions workflow:

```yaml
- name: Run lint
  run: npm run lint

- name: Run tests
  run: npm test

- name: Build
  run: npm run build
```

## Boas Práticas Aplicadas

1. **Isolamento**: Cada teste é isolado usando `beforeEach` para resetar mocks
2. **Clareza**: Nomes descritivos como "should throw ForbiddenException if not a member"
3. **Cobertura de erros**: Testes para todos os casos de exceção
4. **Mocking apropriado**: Uso de jest.fn() para controlar retornos
5. **Organização**: Testes agrupados por método usando `describe`
6. **Transações**: Mock correto de transações do Prisma
7. **Tipos**: Uso do TypeScript com tipos do @prisma/client

## Próximos Passos

- [ ] Adicionar testes de integração (E2E)
- [ ] Aumentar cobertura para 90%+ com `npm run test:cov`
- [ ] Adicionar testes para guards (JwtAuthGuard)
- [ ] Adicionar testes para decorators customizados (@CurrentUserId)
- [ ] Adicionar testes de validação de DTOs
- [ ] Configurar threshold de cobertura mínima no Jest

--- Executando Testes Localmente

1. **Instalar dependências**:
   ```bash
   cd backend
   npm install
   ```

2. **Executar todos os testes**:
   ```bash
   npm test
   ```

3. **Modo watch para desenvolvimento**:
   ```bash
   npm run test:watch
   ```

4. **Ver cobertura de código**:
   ```bash
   npm run test:cov
   ```

## Troubleshooting

### Erro "Cannot find module"

- Verifique se os caminhos de import estão corretos
- Certifique-se de que o arquivo de teste está no mesmo diretório que o serviço

### Erro "Cannot redefine property"

- Ocorre ao tentar fazer spyOn múltiplas vezes no bcrypt
- Solução: Use `jest.mock()` no topo do arquivo

### Testes falhando em transações

- Verifique se o mock de `$transaction` está retornando o valor correto
- Use callback mockado que simule o comportamento transacional

## Resumo

✅ **85 testes** passando  
✅ **10 suites** de teste  
✅ **100%** de sucesso  
✅ Integrado ao **CI/CD**  
✅ **Repository Pattern** implementado  
✅ **3 camadas** testadas (Repository, Service, Controller)  
✅ **Mocking apropriado** em cada camada  
✅ **Type Safety** com TypeScript  

### Distribuição de Testes

- **Repositories**: 42 testes (AuthRepository: 13, CompaniesRepository: 8, InvitesRepository: 21)
- **Services**: 26 testes (AuthService: 6, CompaniesService: 11, InvitesService: 9)
- **Controllers**: 16 testes (AuthController: 4, CompaniesController: 7, InvitesController: 4, AppController: 1)

### Arquivos Criados/Modificados na Refatoração

#### Repositories (NOVOS)
- `src/auth/repository/auth.repository.ts`
- `src/auth/repository/auth.repository.spec.ts`
- `src/companies/repository/companies.repository.ts`
- `src/companies/repository/companies.repository.spec.ts`
- `src/invites/repository/invites.repository.ts`
- `src/invites/repository/invites.repository.spec.ts`

#### Services (REFATORADOS)
- `src/auth/service/auth.service.ts` - Usa AuthRepository
- `src/auth/service/auth.service.spec.ts` - Mock de AuthRepository
- `src/companies/service/companies.service.ts` - Usa CompaniesRepository
- `src/companies/service/companies.service.spec.ts` - Recriado com CompaniesRepository
- `src/invites/service/invites.service.ts` - Usa InvitesRepository
- `src/invites/service/invites.service.spec.ts` - Recriado com InvitesRepository

#### Modules (ATUALIZADOS)
- `src/auth/auth.module.ts` - Provider: AuthRepository
- `src/companies/companies.module.ts` - Provider: CompaniesRepository
- `src/invites/invites.module.ts` - Provider: InvitesRepository

### Impacto da Refatoração

**Antes (sem Repository Pattern):**
- 46 testes
- Services acessavam PrismaService diretamente
- Testes de Services mockavam PrismaService
- Lógica de banco misturada com lógica de negócio

**Depois (com Repository Pattern):**
- 85 testes (+85% de testes)
- 3 camadas bem definidas (Controller → Service → Repository)
- Services focados em lógica de negócio
- 42 testes novos de Repositories
- Melhor testabilidade e manutenibilidade

### Próximas Melhorias

- [ ] Adicionar testes E2E com Supertest
- [ ] Testar Guards (JwtAuthGuard) isoladamente
- [ ] Testar decorators customizados (@CurrentUserId)
- [ ] Aumentar cobertura de código para 90%+
- [ ] Adicionar testes de validação de DTOs
- [ ] Testar casos de edge de ParseIntPipe nos controllers
