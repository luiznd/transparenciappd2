# Portais Transparência — Solid React + Go + Mongo

Este projeto é um monorepo com frontend em React (Vite + Tailwind) e backend em Go (Gin + MongoDB), seguindo princípios de arquitetura SOLID e separação de camadas (Controller → Service → Repository → Model → Middleware → Config).

## Sumário
- Visão geral
- Arquitetura e princípios SOLID
- Estrutura de pastas
- Configuração e execução (Docker Compose e local)
- Variáveis de ambiente
- Fluxo de autenticação e autorização
- Endpoints principais
- Scripts úteis (admin, senhas, inicialização)
- Desenvolvimento do frontend
- Boas práticas e contribuição

## Visão geral
O objetivo é gerenciar portais de transparência e um painel administrativo de usuários com login tradicional e OAuth Google, aprovação de contas, papéis de acesso e edição de dados de portais.

## Arquitetura e princípios SOLID
O backend foi ajustado para reforçar os princípios SOLID:
- Single Responsibility: cada camada tem responsabilidades bem definidas (controllers só tratam HTTP; services contêm regras de negócio; repositories manipulam o banco; middleware trata autenticação).
- Open/Closed: interfaces permitem estender comportamentos sem modificar consumidores (ex.: PortalRepository tem mock e implementação MongoDB; é possível adicionar GCS).
- Liskov Substitution: controllers e services dependem de interfaces; qualquer implementação concreta que satisfaça a interface pode ser utilizada.
- Interface Segregation: interfaces de repositórios são focadas no domínio (UserRepository, SessionRepository, PortalRepository).
- Dependency Inversion: o main realiza a injeção de dependências; controllers recebem services; services recebem repositories. A conexão ao banco é criada uma única vez e injetada nos repositórios com NewUserRepositoryDB e NewPortalRepositoryDB.

## Estrutura de pastas
```
backend-go/
  controller/        # HTTP handlers (Gin)
  service/           # Regras de negócio, interfaces de serviços
  repository/        # Interfaces e implementações de acesso a dados
  middleware/        # Autenticação de sessão, etc.
  model/             # Modelos de domínio e DTOs
  config/            # Configuração (fonte de dados, flags)
  main.go            # Injeção de dependências e servidor HTTP

frontend/
  src/               # App React (Vite + Tailwind)
  ...                # Rotas, contextos, páginas, componentes

docker-compose.yml   # MongoDB e serviços auxiliares
```

### Ajustes de arquitetura realizados
- Repositórios agora podem ser construídos com a mesma conexão Mongo via `NewUserRepositoryDB(db)` e `NewPortalRepositoryDB(db)`, evitando múltiplas conexões e reforçando DI.
- `main.go` centraliza a criação do `*mongo.Database` e injeta nos repositórios (User, Session, Portal).
- Middleware de sessão (`SessionAuthMiddleware`) exige header `Authorization: Bearer <token>` e injeta `userID` no contexto para handlers protegidos.

## Configuração e execução

### Requisitos
- Docker e Docker Compose
- Go 1.20+
- Node.js 18+

### Subir ambiente com Docker Compose
1. Ajuste (se necessário) portas e credenciais em `docker-compose.yml`.
2. Execute:
   - `docker-compose up -d`
3. Mongo estará acessível em `mongodb://root:admin@localhost:27018/portalDB?authSource=admin`.

### Executar backend (Go)
1. No Windows/PowerShell:
   - `cd backend-go`
   - `go build .`
   - `set MONGO_URI=mongodb://root:admin@localhost:27018/portalDB?authSource=admin&directConnection=true`
   - `go run main.go` ou `./backend-go.exe`
2. O servidor inicia em `http://localhost:8081`.

### Executar frontend (Vite)
1. `cd frontend`
2. `npm install`
3. `npm run dev -- --port 3033`
4. Acesse `http://localhost:3034` (o Vite proxy aponta para o backend via `/api`).

## Variáveis de ambiente
- `MONGO_URI`: string de conexão do MongoDB.
- OAuth Google:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URL`

## Fluxo de autenticação e autorização
- Login tradicional (`/api/auth/login`): retorna `token` e `expiresAt`.
- O frontend salva `sessionToken` no `localStorage` e envia `Authorization: Bearer <token>` em todas as chamadas protegidas.
- Middleware valida token e injeta `userID`.
- Endpoints sob `/api/users` exigem autenticação; listagem e alterações (approve/role) exigem `role=admin`.

## Endpoints principais (resumo)
- `POST /api/auth/register` — cria usuário (sem token; aprovado=false; role=user).
- `POST /api/auth/login` — autentica e cria sessão (token Bearer).
- `POST /api/auth/logout` — encerra sessão (header Authorization obrigatório).
- `POST /api/auth/validate` — valida token e retorna usuário.
- `GET  /api/users/me` — usuário atual (autenticado).
- `GET  /api/users` — listar usuários (admin).
- `PUT  /api/users/:id/approve` — aprovar/revogar (admin).
- `PUT  /api/users/:id/role` — atualizar role (admin).
- `GET  /api/portals` — listar portais.
- `PUT  /api/portals/:id` — atualizar campos editáveis.

## Scripts úteis
- `update_admin.js` / `create_admin.js` / `init_admin.js`: promovem/ajustam usuário admin.
- `reset_password.js`, `set_admin_password.js`: utilitários de senha.
- Exemplo via docker-compose:
  - `docker-compose exec mongo mongosh -u root -p admin --authenticationDatabase admin portalDB --eval 'db.users.updateOne({ username: "luiznd" }, { $set: { aprovado: true, role: "admin" } })'`

## Desenvolvimento do frontend
- O `AuthContext` centraliza autenticação e garante que `/api/users/me` e rotas protegidas sempre enviem `Authorization: Bearer <token>`.
- Páginas admin usam `ProtectedRoute` e validam `user.role`.
- AdminUsers filtra/ordena/edita com headers explícitos.

## Boas práticas e contribuição
- Mantenha controllers enxutos; mova regras para services.
- Não acesse o banco diretamente nos controllers.
- Sempre validar entradas em DTOs.
- Evite duplicar conexões ao banco; injete `*mongo.Database` nos repositórios.
- Use logs sem vazar dados sensíveis.
- Pull Requests com testes básicos são bem-vindos.

---
Caso encontre problemas de autenticação (401/“Token de autorização não fornecido”), verifique se o header `Authorization` está presente e se o token não expirou. Refaça login e tente novamente.