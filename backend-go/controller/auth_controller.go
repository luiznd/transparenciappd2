package controller

import (
	"log"
	"net/http"
	"strings"
	"time"

	"solid_react_golang_mongo_project/backend-go/model"
	"solid_react_golang_mongo_project/backend-go/service"

	"github.com/gin-gonic/gin"
)

type AuthController struct {
	authService service.AuthService
}

type AuthResponse struct {
	Token     string `json:"token"`
	User      User   `json:"user"`
	Message   string `json:"message"`
	ExpiresAt string `json:"expiresAt"`
}

type User struct {
	ID      string `json:"id"`
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture,omitempty"`
}

func NewAuthController(authService service.AuthService) *AuthController {
	return &AuthController{
		authService: authService,
	}
}

func (c *AuthController) RegisterRoutes(router *gin.RouterGroup) {
	authRouter := router.Group("/auth")
	{
		// Rotas de autenticação Google
		authRouter.GET("/google", c.GoogleAuth)
		authRouter.GET("/google/callback", c.GoogleCallback)

		// Rotas de autenticação tradicional
		authRouter.POST("/register", c.Register)
		authRouter.POST("/login", c.Login)
		authRouter.POST("/logout", c.Logout)

		// Rotas de validação e usuário
		authRouter.POST("/validate", c.ValidateToken)
		authRouter.GET("/user", c.GetCurrentUser)
	}
}

// Register registra um novo usuário
func (c *AuthController) Register(ctx *gin.Context) {
	var req model.RegisterRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Validações básicas
	if req.Nome == "" || req.Email == "" || req.Username == "" || req.Senha == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Todos os campos são obrigatórios"})
		return
	}

	response, err := c.authService.Register(req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if !response.Success {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": response.Message})
		return
	}

	authResponse := AuthResponse{
		Token:     "", // Registro não retorna token
		ExpiresAt: "",
		User: User{
			ID:    response.User.ID.Hex(),
			Email: response.User.Email,
			Name:  response.User.Nome,
		},
		Message: response.Message,
	}

	ctx.JSON(http.StatusOK, authResponse)
}

// Login autentica um usuário
func (c *AuthController) Login(ctx *gin.Context) {
	log.Println("Iniciando processo de login...")
	var req model.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		log.Printf("Erro ao fazer bind do JSON: %v", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}
	log.Printf("Requisição de login recebida para o usuário: %s", req.Username)

	// Validações básicas
	if req.Username == "" || req.Senha == "" {
		log.Println("Username ou senha não fornecidos.")
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Username e senha são obrigatórios"})
		return
	}

	response, err := c.authService.Login(req)
	if err != nil {
		log.Printf("Erro retornado pelo authService.Login: %v", err)
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	log.Printf("Resposta do authService.Login: Sucesso=%t, Mensagem=%s", response.Success, response.Message)

	if !response.Success {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": response.Message})
		return
	}

	authResponse := AuthResponse{
		Token:     response.Token,
		ExpiresAt: time.Unix(response.ExpiresAt, 0).Format("2006-01-02T15:04:05Z07:00"),
		User: User{
			ID:    response.User.ID.Hex(),
			Email: response.User.Email,
			Name:  response.User.Nome,
		},
		Message: "Login realizado com sucesso",
	}

	ctx.JSON(http.StatusOK, authResponse)
}

// Logout encerra a sessão do usuário
func (c *AuthController) Logout(ctx *gin.Context) {
	// Extrair token do header Authorization
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização não fornecido"})
		return
	}

	// Remover "Bearer " do início
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
		return
	}

	err := c.authService.Logout(tokenString)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao fazer logout"})
		return
	}

	response := map[string]string{
		"message": "Logout realizado com sucesso",
	}

	ctx.JSON(http.StatusOK, response)
}

// GoogleAuth inicia o fluxo de autenticação do Google
func (c *AuthController) GoogleAuth(ctx *gin.Context) {
	state := "random-state-string" // Em produção, use um estado aleatório seguro
	url := c.authService.GetAuthURL(state)

	ctx.JSON(http.StatusOK, gin.H{
		"auth_url": url,
		"state":    state,
	})
}

// GoogleCallback processa o callback do Google OAuth
func (c *AuthController) GoogleCallback(ctx *gin.Context) {
	code := ctx.Query("code")

	if code == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Código de autorização não fornecido"})
		return
	}

	// Em produção, validar o state
	// fmt.Printf("State recebido: %s\n", state)

	// Trocar código por token
	token, err := c.authService.ExchangeCodeForToken(code)
	if err != nil {
		// fmt.Printf("Erro ao trocar código por token: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter token de acesso"})
		return
	}

	// Obter informações do usuário
	userInfo, err := c.authService.GetUserInfo(token)
	if err != nil {
		// fmt.Printf("Erro ao obter informações do usuário: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter informações do usuário"})
		return
	}

	// Fazer login com Google
	response, err := c.authService.LoginWithGoogle(userInfo.ID, userInfo.Email, userInfo.Name, userInfo.Picture)
	if err != nil {
		// fmt.Printf("Erro ao fazer login com Google: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao autenticar usuário"})
		return
	}

	if !response.Success {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": response.Message})
		return
	}

	// Resposta de sucesso
	authResponse := AuthResponse{
		Token:     response.Token,
		ExpiresAt: time.Unix(response.ExpiresAt, 0).Format("2006-01-02T15:04:05Z07:00"),
		User: User{
			ID:      response.User.ID.Hex(),
			Email:   response.User.Email,
			Name:    response.User.Nome,
			Picture: userInfo.Picture,
		},
		Message: response.Message,
	}

	ctx.JSON(http.StatusOK, authResponse)
}

// ValidateToken valida um token de sessão
func (c *AuthController) ValidateToken(ctx *gin.Context) {
	var request struct {
		Token string `json:"token"`
	}

	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	user, err := c.authService.ValidateSession(request.Token)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	response := gin.H{
		"valid": true,
		"user": User{
			ID:    user.ID.Hex(),
			Email: user.Email,
			Name:  user.Nome,
		},
	}

	ctx.JSON(http.StatusOK, response)
}

// GetCurrentUser obtém informações do usuário atual baseado no token de sessão
func (c *AuthController) GetCurrentUser(ctx *gin.Context) {
	// Extrair token do header Authorization
	authHeader := ctx.GetHeader("Authorization")
	if authHeader == "" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização não fornecido"})
		return
	}

	// Remover "Bearer " do início
	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
		return
	}

	user, err := c.authService.ValidateSession(tokenString)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	userResponse := User{
		ID:    user.ID.Hex(),
		Email: user.Email,
		Name:  user.Nome,
	}

	// Adicionar picture se existir
	if user.Picture != "" {
		userResponse.Picture = user.Picture
	}

	ctx.JSON(http.StatusOK, userResponse)
}