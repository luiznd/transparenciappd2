package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// URI de conexão - mesma usada pelo backend
	uri := "mongodb://root:admin@mongo:27017/portalDB?authSource=admin"
	
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Conectar ao MongoDB
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Fatalf("Erro ao conectar: %v", err)
	}
	defer client.Disconnect(ctx)

	// Testar ping
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Erro no ping: %v", err)
	}
	fmt.Println("✓ Conexão com MongoDB OK!")

	// Testar acesso ao portalDB
	db := client.Database("portalDB")
	collection := db.Collection("users")

	// Buscar usuário luiznd
	var user bson.M
	err = collection.FindOne(ctx, bson.M{"username": "luiznd"}).Decode(&user)
	if err != nil {
		log.Fatalf("Erro ao buscar usuário: %v", err)
	}
	
	fmt.Printf("✓ Usuário luiznd encontrado!\n")
	fmt.Printf("  Nome: %s\n", user["nome"])
	fmt.Printf("  Email: %s\n", user["email"])
	fmt.Printf("  Aprovado: %v\n", user["aprovado"])
	fmt.Printf("  Role: %s\n", user["role"])
	
	// Testar autenticação com bcrypt
	// Vamos verificar se a senha está correta
	fmt.Printf("\n🔐 Testando autenticação...\n")
	
	// Simular tentativa de login
	fmt.Printf("Hash da senha no BD: %s\n", user["senha"])
	
	// Verificar se o hash é válido para "admin123"
	// Isso seria feito pelo backend usando bcrypt.CompareHashAndPassword
	fmt.Printf("📝 O backend deve comparar o hash com a senha fornecida\n")
	fmt.Printf("💡 Dica: Use 'admin123' como senha para o usuário luiznd\n")
}