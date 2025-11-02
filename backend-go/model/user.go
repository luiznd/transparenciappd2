package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	Nome         string             `bson:"nome" json:"nome" validate:"required"`
	Email        string             `bson:"email" json:"email" validate:"required,email"`
	Username     string             `bson:"username" json:"username"`
	Senha        string             `bson:"senha" json:"senha"`
	GoogleID     string             `bson:"googleId,omitempty" json:"googleId,omitempty"`
	Picture      string             `bson:"picture,omitempty" json:"picture,omitempty"`
	AuthProvider string             `bson:"authProvider" json:"authProvider"` // "local" ou "google"
	Aprovado     bool               `bson:"aprovado" json:"aprovado"`         // Flag para aprovação de acesso
	Role         string             `bson:"role" json:"role"`                 // "admin", "user", etc.
	CriadoEm     time.Time          `bson:"criadoEm" json:"criadoEm"`
	AtualizadoEm time.Time          `bson:"atualizadoEm" json:"atualizadoEm"`
}

type Session struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	UserID    primitive.ObjectID `bson:"userId" json:"userId"`
	Token     string             `bson:"token" json:"token"`
	ExpiresAt time.Time          `bson:"expiresAt" json:"expiresAt"`
	CriadoEm  time.Time          `bson:"criadoEm" json:"criadoEm"`
}

type RegisterRequest struct {
	Nome     string `json:"nome" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
	Username string `json:"username" validate:"required"`
	Senha    string `json:"senha" validate:"required,min=6"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Senha    string `json:"senha" validate:"required"`
}

type LoginResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	User      *User  `json:"user,omitempty"`
	Token     string `json:"token,omitempty"`
	ExpiresAt int64  `json:"expiresAt,omitempty"`
}

type RegisterResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	User    *User  `json:"user,omitempty"`
}