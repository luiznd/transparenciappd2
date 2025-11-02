package repository

import (
	"context"
	"log"
	"os"
	"time"

	"solid_react_golang_mongo_project/backend-go/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type UserRepository interface {
	CreateUser(user *model.User) error
	FindUserByUsername(username string) (*model.User, error)
	FindUserByEmail(email string) (*model.User, error)
	FindUserByGoogleID(googleID string) (*model.User, error)
	FindUserByID(id primitive.ObjectID) (*model.User, error)
	UpdateUser(user *model.User) error
	FindAllUsers() ([]*model.User, error)
}

type userRepository struct {
    collection *mongo.Collection
}

// NewUserRepository cria uma instância conectando por MONGO_URI (modo legado).
// Preferir NewUserRepositoryDB para injeção de dependência e reaproveitamento de conexão.
func NewUserRepository() UserRepository {
    uri := os.Getenv("MONGO_URI")
    if uri == "" {
        log.Fatal("MONGO_URI não definida")
    }
    clientOptions := options.Client().ApplyURI(uri)
    client, err := mongo.Connect(context.Background(), clientOptions)
    if err != nil {
        log.Printf("Erro ao conectar ao MongoDB: %v", err)
        log.Fatal(err)
    }
    // Testar a conexão
    ctx := context.Background()
    if err = client.Ping(ctx, nil); err != nil {
        log.Printf("Erro ao fazer ping no MongoDB: %v", err)
        log.Fatal(err)
    }
    collection := client.Database("portalDB").Collection("users")
    return &userRepository{collection: collection}
}

// NewUserRepositoryDB cria o repositório usando a conexão já existente (injeção de dependência).
func NewUserRepositoryDB(db *mongo.Database) UserRepository {
    return &userRepository{collection: db.Collection("users")}
}

func (r *userRepository) CreateUser(user *model.User) error {
	user.CriadoEm = time.Now()
	user.AtualizadoEm = time.Now()
	_, err := r.collection.InsertOne(context.Background(), user)
	if err != nil {
		log.Printf("Erro ao criar usuário: %v", err)
		return err
	}
	log.Printf("Usuário criado com sucesso: %s", user.Email)
	return nil
}

func (r *userRepository) FindUserByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.collection.FindOne(context.Background(), bson.M{"username": username}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindUserByEmail(email string) (*model.User, error) {
	var user model.User
	err := r.collection.FindOne(context.Background(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindUserByGoogleID(googleID string) (*model.User, error) {
	var user model.User
	err := r.collection.FindOne(context.Background(), bson.M{"googleId": googleID}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) FindUserByID(id primitive.ObjectID) (*model.User, error) {
	var user model.User
	err := r.collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *userRepository) UpdateUser(user *model.User) error {
	user.AtualizadoEm = time.Now()
	filter := bson.M{"_id": user.ID}
	update := bson.M{"$set": user}
	_, err := r.collection.UpdateOne(context.Background(), filter, update)
	if err != nil {
		log.Printf("Erro ao atualizar usuário: %v", err)
		return err
	}
	log.Printf("Usuário atualizado com sucesso: %s", user.Email)
	return nil
}

func (r *userRepository) FindAllUsers() ([]*model.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var users []*model.User
	if err = cursor.All(ctx, &users); err != nil {
		return nil, err
	}

	return users, nil
}