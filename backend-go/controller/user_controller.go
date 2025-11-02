package controller

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "solid_react_golang_mongo_project/backend-go/middleware"
    "solid_react_golang_mongo_project/backend-go/service"
)

type UserController struct {
    userService service.UserService
    authService service.AuthService
}

func NewUserController(userService service.UserService, authService service.AuthService) *UserController {
    return &UserController{
        userService: userService,
        authService: authService,
    }
}

func (c *UserController) RegisterRoutes(router *gin.RouterGroup) {
    userRouter := router.Group("/users")
    // Proteger as rotas de usuários com middleware de sessão
    userRouter.Use(middleware.SessionAuthMiddleware(c.authService))
    {
        userRouter.GET("", c.GetAllUsers)
        userRouter.GET("/me", c.GetCurrentUser)
        userRouter.PUT("/:id/approve", c.ApproveUser)
        userRouter.PUT("/:id/role", c.UpdateUserRole)
    }
}

// GetAllUsers retorna todos os usuários (apenas para admins)
func (c *UserController) GetAllUsers(ctx *gin.Context) {
	// Verificar se o usuário é admin
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Não autorizado"})
		return
	}

	currentUser, err := c.userService.GetUserByID(userID.(primitive.ObjectID))
	if err != nil || currentUser == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
		return
	}

	if currentUser.Role != "admin" {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
		return
	}

	// Buscar todos os usuários
	users, err := c.userService.GetAllUsers()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuários"})
		return
	}

	ctx.JSON(http.StatusOK, users)
}

// GetCurrentUser retorna o usuário atual
func (c *UserController) GetCurrentUser(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Não autorizado"})
		return
	}

	user, err := c.userService.GetUserByID(userID.(primitive.ObjectID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar usuário"})
		return
	}

	if user == nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Usuário não encontrado"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"user": user})
}

// ApproveUser aprova ou revoga acesso de um usuário
func (c *UserController) ApproveUser(ctx *gin.Context) {
	// Verificar se o usuário é admin
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Não autorizado"})
		return
	}

	currentUser, err := c.userService.GetUserByID(userID.(primitive.ObjectID))
	if err != nil || currentUser == nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
		return
	}

	if currentUser.Role != "admin" {
		ctx.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
		return
	}

	// Obter ID do usuário a ser aprovado
	targetUserID, err := primitive.ObjectIDFromHex(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuário inválido"})
		return
	}

	// Obter dados da requisição
	var req struct {
		Aprovado bool `json:"aprovado"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	// Atualizar status de aprovação
	err = c.userService.UpdateUserApproval(targetUserID, req.Aprovado)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar usuário"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Status de aprovação atualizado"})
}

// UpdateUserRole atualiza o papel de um usuário (apenas admin)
func (c *UserController) UpdateUserRole(ctx *gin.Context) {
    // Verificar se o usuário é admin
    userID, exists := ctx.Get("userID")
    if !exists {
        ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Não autorizado"})
        return
    }

    currentUser, err := c.userService.GetUserByID(userID.(primitive.ObjectID))
    if err != nil || currentUser == nil {
        ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
        return
    }

    if currentUser.Role != "admin" {
        ctx.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
        return
    }

    // Obter ID e payload
    targetUserID, err := primitive.ObjectIDFromHex(ctx.Param("id"))
    if err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID de usuário inválido"})
        return
    }

    var req struct {
        Role string `json:"role"`
    }
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
        return
    }

    // Atualizar role via service
    if err := c.userService.UpdateUserRole(targetUserID, req.Role); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx.JSON(http.StatusOK, gin.H{"success": true, "message": "Role atualizado"})
}