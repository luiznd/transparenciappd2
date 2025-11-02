package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/dgrijalva/jwt-go"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// GetUserIDFromToken extrai o ID do usuário do token JWT
func GetUserIDFromToken(r *http.Request) (primitive.ObjectID, error) {
	// Obter token do cabeçalho Authorization
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return primitive.NilObjectID, errors.New("token não fornecido")
	}

	// Formato esperado: "Bearer {token}"
	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return primitive.NilObjectID, errors.New("formato de token inválido")
	}

	tokenString := tokenParts[1]

	// Verificar e decodificar o token
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		// Verificar o método de assinatura
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("método de assinatura inválido")
		}
		// Chave secreta usada para assinar o token (deve ser a mesma usada na criação)
		return []byte("chave-secreta-jwt"), nil
	})

	if err != nil {
		return primitive.NilObjectID, err
	}

	// Extrair claims do token
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		// Obter ID do usuário das claims
		userIDStr, ok := claims["id"].(string)
		if !ok {
			return primitive.NilObjectID, errors.New("ID do usuário não encontrado no token")
		}

		// Converter string para ObjectID
		userID, err := primitive.ObjectIDFromHex(userIDStr)
		if err != nil {
			return primitive.NilObjectID, errors.New("ID do usuário inválido")
		}

		return userID, nil
	}

	return primitive.NilObjectID, errors.New("token inválido")
}

// AuthMiddleware verifica se o usuário está autenticado
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Permitir requisições OPTIONS para CORS
		if r.Method == "OPTIONS" {
			next.ServeHTTP(w, r)
			return
		}

		// Verificar token
		_, err := GetUserIDFromToken(r)
		if err != nil {
			http.Error(w, "Não autorizado", http.StatusUnauthorized)
			return
		}

		// Usuário autenticado, continuar
		next.ServeHTTP(w, r)
	})
}