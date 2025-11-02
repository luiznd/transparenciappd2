
package controller

import (
    "net/http"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "solid_react_golang_mongo_project/backend-go/middleware"
    "solid_react_golang_mongo_project/backend-go/service"
)

type PortalController struct {
    service     service.PortalService
    authService service.AuthService
    userService service.UserService
}

func NewPortalController(s service.PortalService, auth service.AuthService, userSvc service.UserService) *PortalController {
    return &PortalController{service: s, authService: auth, userService: userSvc}
}

func (c *PortalController) RegisterRoutes(r *gin.RouterGroup) {
    // Rotas públicas de leitura
    r.GET("/portals", c.GetAllPortals)
    r.GET("/portals/:id", c.GetPortalByID)

    // Rotas protegidas para edição
    portalRouter := r.Group("/portals")
    portalRouter.Use(middleware.SessionAuthMiddleware(c.authService))
    {
        portalRouter.PUT(":id", c.UpdatePortal)
    }
}

func (c *PortalController) GetAllPortals(ctx *gin.Context) {
    portals, err := c.service.GetAllPortals()
    if err != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(http.StatusOK, portals)
}

func (c *PortalController) GetPortalByID(ctx *gin.Context) {
    id := ctx.Param("id")
    portal, err := c.service.GetPortalByID(id)
    if err != nil {
        ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
        return
    }
    ctx.JSON(http.StatusOK, portal)
}

// UpdatePortal atualiza campos editáveis do portal (somente admins)
func (c *PortalController) UpdatePortal(ctx *gin.Context) {
    // Verificar autenticação e autorização
    userIDVal, exists := ctx.Get("userID")
    if !exists {
        ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Não autorizado"})
        return
    }

    currentUser, err := c.userService.GetUserByID(userIDVal.(primitive.ObjectID))
    if err != nil || currentUser == nil {
        ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Usuário não encontrado"})
        return
    }
    // Permitir que usuários com papel "admin" ou "editor" atualizem
    if currentUser.Role != "admin" && currentUser.Role != "editor" {
        ctx.JSON(http.StatusForbidden, gin.H{"error": "Acesso negado"})
        return
    }

    id := ctx.Param("id")
    // Payload esperado: apenas campos editáveis
    // Campos editáveis suportados
    var req struct {
        ObservacaoTimeDados *string `json:"observacaoTimeDados"`
        Enviar              *bool   `json:"enviar"`
        Status              *string `json:"status"`
        PulouCompetencia    *bool   `json:"pulouCompetencia"`
        DefasagemNosDados   *bool   `json:"defasagemNosDados"`
        NovosDados          *bool   `json:"novosDados"`
    }
    if bindErr := ctx.ShouldBindJSON(&req); bindErr != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
        return
    }

    // Montar mapa de atualizações apenas com campos fornecidos
    updates := bson.M{}
    if req.ObservacaoTimeDados != nil { updates["observacaoTimeDados"] = *req.ObservacaoTimeDados }
    if req.Enviar != nil { updates["enviar"] = *req.Enviar }
    if req.PulouCompetencia != nil { updates["pulouCompetencia"] = *req.PulouCompetencia }
    if req.DefasagemNosDados != nil { updates["defasagemNosDados"] = *req.DefasagemNosDados }
    if req.NovosDados != nil { updates["novosDados"] = *req.NovosDados }
    if req.Status != nil {
        // Validar status permitido
        allowed := map[string]bool{"OK": true, "WARNING": true, "ERROR": true}
        if !allowed[*req.Status] {
            ctx.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido"})
            return
        }
        updates["status"] = *req.Status
    }

    if len(updates) == 0 {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo válido para atualização"})
        return
    }

    // Atualizar campos
    if updateErr := c.service.UpdatePortalFieldsMap(id, updates); updateErr != nil {
        ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar portal"})
        return
    }

    // Retornar o portal atualizado
    updated, _ := c.service.GetPortalByID(id)
    ctx.JSON(http.StatusOK, gin.H{"success": true, "portal": updated})
}
