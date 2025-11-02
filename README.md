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
3. Mongo estará acessível em `mongodb://user:pass@localhost:27018/portalDB?authSource=admin`.
   Observação: o script `init_db.js` não é mais montado por padrão. A inicialização do banco ocorre dinamicamente pelo aplicativo. Se precisar criar um admin inicialmente, utilize o comando `mongosh` abaixo na seção “Scripts úteis”.

### Executar backend (Go)
1. No Windows/PowerShell:
   - `cd backend-go`
   - `go build .`
   - `set MONGO_URI=mongodb://user:pass@localhost:27018/portalDB?authSource=admin&directConnection=true`
   - `go run main.go` ou `./backend-go.exe`
2. O servidor inicia em `http://localhost:8081`.

### Executar frontend (Vite)
1. `cd frontend`
2. `npm install`
3. `npm run dev -- --port 3033`
4. Acesse `http://localhost:3033` (o Vite proxy aponta para o backend via `/api`).

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

### Exemplos de chamadas (curl)

Login tradicional:

```
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"user","senha":"pass"}'
```

Validar token e pegar usuário atual:

```
# Substitua SEU_TOKEN pelo token retornado no login
curl -X GET http://localhost:8081/api/users/me \
  -H "Authorization: Bearer SEU_TOKEN"
```

Listar usuários (admin):

```
curl -X GET http://localhost:8081/api/users \
  -H "Authorization: Bearer SEU_TOKEN"
```

Aprovar usuário:

```
curl -X PUT http://localhost:8081/api/users/ID_DO_USUARIO/approve \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"aprovado":true}'
```

Atualizar papel:

```
curl -X PUT http://localhost:8081/api/users/ID_DO_USUARIO/role \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

Logout:

```
curl -X POST http://localhost:8081/api/auth/logout \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Papéis e fluxo Admin
- Papéis suportados: `user` (padrão), `editor` e `admin`.
- Usuários novos ficam com `aprovado=false`. Apenas administradores podem aprovar (`PUT /api/users/:id/approve`).
- Apenas administradores podem listar todos os usuários e alterar papéis (`PUT /api/users/:id/role`).
- `editor` é pensado para permissões de edição de portais; `user` possui acesso básico de leitura. O backend aplica o bloqueio de ações administrativas via middleware/controller.

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
- `init_db.js` (opcional): script de inicialização do banco. Atualmente NÃO é montado pelo Docker Compose.
- Para promover usuário a admin ou ajustar aprovação, use diretamente o mongosh:
  - `docker-compose exec mongo mongosh -u root -p admin --authenticationDatabase admin portalDB --eval 'db.users.updateOne({ username: "luiznd" }, { $set: { aprovado: true, role: "admin" } })'`

## Coleções para teste (Postman/Insomnia)
- Você pode importar a coleção Postman disponível em `docs/postman_collection.json`.
- A coleção inclui endpoints de autenticação, usuário e portais. Ajuste as variáveis `baseUrl` e `token` conforme seu ambiente.

## Makefile
O projeto inclui um `Makefile` com alvos úteis:
- `make backend-run` — roda o backend local.
- `make backend-test` — executa testes com cobertura.
- `make coverage` — mostra resumo da cobertura.
- `make frontend-dev` — sobe o Vite na porta 3033.
- `make frontend-build` — compila o frontend.
- `make browserslist-update` — atualiza a base do Browserslist.
- `make docker-up` / `make docker-down` — gerencia serviços via Docker Compose.
- `make ci` — executa build/test backend e build frontend localmente.

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