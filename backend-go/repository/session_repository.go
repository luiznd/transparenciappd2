package repository

import (
	"context"
	"log"
	"solid_react_golang_mongo_project/backend-go/model"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type SessionRepository interface {
	CreateSession(session model.Session) error
	GetSessionByToken(token string) (*model.Session, error)
	DeleteSession(token string) error
	DeleteExpiredSessions() error
	DeleteUserSessions(userID primitive.ObjectID) error
}

type sessionRepository struct {
	collection *mongo.Collection
}

func NewSessionRepository(db *mongo.Database) SessionRepository {
	return &sessionRepository{
		collection: db.Collection("sessions"),
	}
}

func (r *sessionRepository) CreateSession(session model.Session) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.InsertOne(ctx, session)
	if err != nil {
		log.Printf("Erro ao criar sessão: %v", err)
		return err
	}

	log.Printf("Sessão criada com sucesso para usuário: %s", session.UserID.Hex())
	return nil
}

func (r *sessionRepository) GetSessionByToken(token string) (*model.Session, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var session model.Session
	filter := bson.M{
		"token": token,
		"expiresAt": bson.M{"$gt": time.Now()}, // Apenas sessões não expiradas
	}

	err := r.collection.FindOne(ctx, filter).Decode(&session)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil // Sessão não encontrada ou expirada
		}
		log.Printf("Erro ao buscar sessão: %v", err)
		return nil, err
	}

	return &session, nil
}

func (r *sessionRepository) DeleteSession(token string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.DeleteOne(ctx, bson.M{"token": token})
	if err != nil {
		log.Printf("Erro ao deletar sessão: %v", err)
		return err
	}

	log.Printf("Sessão deletada com sucesso")
	return nil
}

func (r *sessionRepository) DeleteExpiredSessions() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"expiresAt": bson.M{"$lt": time.Now()}}
	result, err := r.collection.DeleteMany(ctx, filter)
	if err != nil {
		log.Printf("Erro ao deletar sessões expiradas: %v", err)
		return err
	}

	log.Printf("Deletadas %d sessões expiradas", result.DeletedCount)
	return nil
}

func (r *sessionRepository) DeleteUserSessions(userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.collection.DeleteMany(ctx, bson.M{"userId": userID})
	if err != nil {
		log.Printf("Erro ao deletar sessões do usuário: %v", err)
		return err
	}

	log.Printf("Sessões do usuário deletadas com sucesso")
	return nil
}