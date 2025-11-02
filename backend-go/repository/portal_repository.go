package repository

import (
	"context"
	"log"
	"os"

	"solid_react_golang_mongo_project/backend-go/model"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PortalRepository interface {
    InsertPortal(portal model.Portal) error
    GetAllPortals() ([]model.Portal, error)
    GetPortalByID(id string) (model.Portal, error)
    UpdatePortalFields(id string, fields bson.M) error
}

type portalRepository struct {
    collection *mongo.Collection
}

// NewPortalRepository cria uma instância conectando por MONGO_URI (modo legado).
// Preferir NewPortalRepositoryDB para injeção de dependência e reaproveitamento de conexão.
func NewPortalRepository() PortalRepository {
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
    collection := client.Database("portalDB").Collection("portals")
    return &portalRepository{collection: collection}
}

// NewPortalRepositoryDB cria o repositório usando a conexão já existente (injeção de dependência).
func NewPortalRepositoryDB(db *mongo.Database) PortalRepository {
    return &portalRepository{collection: db.Collection("portals")}
}

func (r *portalRepository) InsertPortal(portal model.Portal) error {
	_, err := r.collection.InsertOne(context.Background(), portal)
	return err
}

func (r *portalRepository) GetAllPortals() ([]model.Portal, error) {
    cursor, err := r.collection.Find(context.Background(), bson.M{})
    if err != nil {
        return nil, err
    }
    var portals []model.Portal
    err = cursor.All(context.Background(), &portals)
    return portals, err
}

func (r *portalRepository) GetPortalByID(id string) (model.Portal, error) {
    var portal model.Portal
    err := r.collection.FindOne(context.Background(), bson.M{"_id": id}).Decode(&portal)
    return portal, err
}

// UpdatePortalFields atualiza campos específicos de um portal identificado por _id
func (r *portalRepository) UpdatePortalFields(id string, fields bson.M) error {
    filter := bson.M{"_id": id}
    update := bson.M{"$set": fields}
    _, err := r.collection.UpdateOne(context.Background(), filter, update)
    return err
}
