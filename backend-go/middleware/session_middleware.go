package middleware

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "solid_react_golang_mongo_project/backend-go/service"
)

// SessionAuthMiddleware valida o token de sessão no header Authorization (Bearer <token>)
// e injeta o userID no contexto do Gin para uso pelos controllers protegidos.
func SessionAuthMiddleware(authService service.AuthService) gin.HandlerFunc {
    return func(ctx *gin.Context) {
        // Permitir requisições OPTIONS (CORS preflight)
        if ctx.Request.Method == http.MethodOptions {
            ctx.Next()
            return
        }

        authHeader := ctx.GetHeader("Authorization")
        if authHeader == "" {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token de autorização não fornecido"})
            return
        }

        // Formato esperado: "Bearer <token>"
        token := strings.TrimPrefix(authHeader, "Bearer ")
        if token == authHeader || token == "" {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Formato de token inválido"})
            return
        }

        user, err := authService.ValidateSession(token)
        if err != nil || user == nil {
            ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
            return
        }

        // Disponibiliza o userID para os handlers subsequentes
        ctx.Set("userID", user.ID)
        ctx.Next()
    }
}