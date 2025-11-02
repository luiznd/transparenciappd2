# Variáveis
FRONTEND_DIR := frontend
BACKEND_DIR := backend-go
API_PORT := 8081
VITE_PORT := 3033

.PHONY: help backend-run backend-build backend-test frontend-dev frontend-build browserslist-update docker-up docker-down ci coverage

help:
	@echo "Targets disponíveis:"
	@echo "  backend-run           - Executa o servidor Go local (usa MONGO_URI do ambiente)"
	@echo "  backend-build         - Compila o backend"
	@echo "  backend-test          - Roda testes do backend com cobertura"
	@echo "  frontend-dev          - Sobe o Vite dev server na porta $(VITE_PORT)"
	@echo "  frontend-build        - Compila o frontend (Vite build)"
	@echo "  browserslist-update   - Atualiza Base Browserslist no frontend"
	@echo "  docker-up             - Sobe serviços via docker-compose"
	@echo "  docker-down           - Derruba serviços do docker-compose"
	@echo "  ci                    - Executa build/test backend e build frontend"
	@echo "  coverage              - Mostra resumo de cobertura do backend"

backend-run:
	cd $(BACKEND_DIR) && go run main.go

backend-build:
	cd $(BACKEND_DIR) && go build ./...

backend-test:
	cd $(BACKEND_DIR) && go test ./... -v -coverprofile=coverage.out -covermode=atomic

coverage:
	cd $(BACKEND_DIR) && go tool cover -func=coverage.out || echo "coverage.out inexistente; rode 'make backend-test' primeiro"

frontend-dev:
	cd $(FRONTEND_DIR) && npm install && npm run dev -- --port $(VITE_PORT)

frontend-build:
	cd $(FRONTEND_DIR) && npm ci && npm run build

browserslist-update:
	cd $(FRONTEND_DIR) && npx --yes update-browserslist-db@latest || true

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

ci: backend-build backend-test frontend-build
	@echo "CI local concluída"