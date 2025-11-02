
package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"solid_react_golang_mongo_project/backend-go/config"
	"solid_react_golang_mongo_project/backend-go/controller"
	"solid_react_golang_mongo_project/backend-go/repository"
	"solid_react_golang_mongo_project/backend-go/service"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"context"
)

func main() {
	fmt.Println("Starting server on port 8081")
	fmt.Println("Inicializando servidor...")

	// Carregar configuração
	cfg := config.LoadConfig()
	fmt.Printf("Fonte de dados configurada: %s\n", cfg.DataSource)

	// Definir variável de ambiente para MongoDB
	// Verificar se já existe uma URI configurada, senão usar localhost para execução local
	if os.Getenv("MONGO_URI") == "" {
		os.Setenv("MONGO_URI", "mongodb://root:admin@localhost:27018/portalDB?authSource=admin&directConnection=true")
		fmt.Println("MongoDB URI configurada para localhost:27018")
	} else {
		fmt.Printf("MongoDB URI já configurada: %s\n", os.Getenv("MONGO_URI"))
	}

	// Conectar ao MongoDB para repositórios de autenticação
	fmt.Println("Conectando ao MongoDB para autenticação...")
	uri := os.Getenv("MONGO_URI")
	clientOptions := options.Client().ApplyURI(uri)
	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		log.Fatalf("Erro ao conectar ao MongoDB: %v", err)
	}
	db := client.Database("portalDB")
	fmt.Println("Conexão com MongoDB estabelecida")

    // Inicializar repositórios usando a mesma conexão (injeção de dependência)
    fmt.Println("Inicializando repositórios...")
    userRepo := repository.NewUserRepositoryDB(db)
    sessionRepo := repository.NewSessionRepository(db)
    fmt.Println("UserRepository e SessionRepository inicializados")

	// Escolher o repository de portais baseado na configuração
	var portalRepo repository.PortalRepository

	switch {
	case cfg.IsMock():
		fmt.Println("Inicializando Mock Portal Repository...")
		portalRepo = repository.NewMockPortalRepository()
		fmt.Println("Mock Portal Repository inicializado")
case cfg.IsGCS():
    fmt.Println("Inicializando GCS Portal Repository...")
    // portalRepo, err = repository.NewGCSPortalRepository(cfg.GCSBucketName, cfg.GCSFileName)
		// if err != nil {
		// 	log.Fatalf("Erro ao inicializar GCS Portal Repository: %v", err)
		// }
		// fmt.Printf("GCS Portal Repository inicializado (bucket: %s, file: %s)\n", cfg.GCSBucketName, cfg.GCSFileName)
    // Temporariamente usando MongoDB até resolver problemas de conectividade do GCS
    fmt.Println("GCS ainda não implementado, usando MongoDB...")
    portalRepo = repository.NewPortalRepositoryDB(db)
    fmt.Println("MongoDB Portal Repository inicializado (fallback do GCS)")
    default: // MongoDB
        fmt.Println("Inicializando MongoDB Portal Repository...")
        portalRepo = repository.NewPortalRepositoryDB(db)
        fmt.Println("MongoDB Portal Repository inicializado")
	}

	// Inicializar services
	fmt.Println("Inicializando services...")
	userService := service.NewUserService(userRepo)
	portalService := service.NewPortalService(portalRepo)
	authService := service.NewAuthService(userRepo, sessionRepo)
	fmt.Println("Services inicializados")

	// Inicializar dados dos portais
	fmt.Println("Inicializando dados dos portais...")
	if err := portalService.InitializeData(); err != nil {
		log.Printf("Aviso: Erro ao inicializar dados dos portais: %v", err)
	} else {
		fmt.Println("Dados dos portais inicializados com sucesso")
	}

	// Inicializar controllers
	fmt.Println("Inicializando controllers...")
    userController := controller.NewUserController(userService, authService)
    portalController := controller.NewPortalController(portalService, authService, userService)
    authController := controller.NewAuthController(authService)
	fmt.Println("Controllers inicializados")

	// Configurar rotas com Gin
	router := gin.Default()

	// Middleware CORS global com Gin
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	
	// Rota raiz
	router.GET("/", func(c *gin.Context) {
		fmt.Printf("Request received: %s %s\n", c.Request.Method, c.Request.URL.Path)
		c.JSON(http.StatusOK, gin.H{
			"message": "API Go funcionando!",
			"status":  "ok",
		})
	})

	// Rota de teste
	router.GET("/api/test", func(c *gin.Context) {
		fmt.Printf("API Test request received: %s %s\n", c.Request.Method, c.Request.URL.Path)
		c.JSON(http.StatusOK, gin.H{
			"message":   "API funcionando!",
			"timestamp": time.Now().Format(time.RFC3339),
		})
	})

	// Registrar rotas dos controllers
	apiRouter := router.Group("/api")
	userController.RegisterRoutes(apiRouter)
	portalController.RegisterRoutes(apiRouter)
	authController.RegisterRoutes(apiRouter)

	// Configurar e iniciar servidor Gin
	fmt.Println("Servidor iniciado em http://0.0.0.0:8081")
	fmt.Println("Rotas disponíveis:")
	fmt.Println("  GET  /")
	fmt.Println("  GET  /api/test")
	fmt.Println("  POST /api/auth/register")
	fmt.Println("  POST /api/auth/login")
	
	if err := router.Run(":8081"); err != nil {
		log.Fatalf("Erro ao iniciar o servidor Gin: %v", err)
	}
}



func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
