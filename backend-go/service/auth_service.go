package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"log"
	"os"
	"solid_react_golang_mongo_project/backend-go/model"
	"solid_react_golang_mongo_project/backend-go/repository"
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	oauth2v2 "google.golang.org/api/oauth2/v2"
	"google.golang.org/api/option"
)

type AuthService interface {
	Register(req model.RegisterRequest) (*model.RegisterResponse, error)
	Login(req model.LoginRequest) (*model.LoginResponse, error)
	LoginWithGoogle(googleID, email, nome, picture string) (*model.LoginResponse, error)
	ValidateSession(token string) (*model.User, error)
	Logout(token string) error
	CleanupExpiredSessions() error
	GetAuthURL(state string) string
	ExchangeCodeForToken(code string) (*oauth2.Token, error)
	GetUserInfo(token *oauth2.Token) (*GoogleUserInfo, error)
}

type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

type authService struct {
	userRepo    repository.UserRepository
	sessionRepo repository.SessionRepository
	oauthConfig *oauth2.Config
}

func NewAuthService(userRepo repository.UserRepository, sessionRepo repository.SessionRepository) AuthService {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURL := os.Getenv("GOOGLE_REDIRECT_URL")

	if clientID == "" || clientSecret == "" || redirectURL == "" {
		fmt.Println("Aviso: Variáveis de ambiente OAuth não configuradas completamente")
		fmt.Println("GOOGLE_CLIENT_ID:", clientID != "")
		fmt.Println("GOOGLE_CLIENT_SECRET:", clientSecret != "")
		fmt.Println("GOOGLE_REDIRECT_URL:", redirectURL != "")
	}

	config := &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email",
			"https://www.googleapis.com/auth/userinfo.profile",
		},
		Endpoint: google.Endpoint,
	}

	return &authService{
		userRepo:    userRepo,
		sessionRepo: sessionRepo,
		oauthConfig: config,
	}
}

func (s *authService) Register(req model.RegisterRequest) (*model.RegisterResponse, error) {
	// Verificar se o usuário já existe pelo email
	existingUser, err := s.userRepo.FindUserByEmail(req.Email)
	if err != nil {
		return nil, err
	}
	if existingUser != nil {
		return nil, errors.New("usuário já existe com este email")
	}
	
	// Verificar se o nome de usuário já está em uso
	existingUsername, err := s.userRepo.FindUserByUsername(req.Username)
	if err != nil {
		return nil, err
	}
	if existingUsername != nil {
		return nil, errors.New("nome de usuário já está em uso")
	}

	// Hash da senha
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Senha), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Criar novo usuário
	user := &model.User{
		ID:           primitive.NewObjectID(),
		Nome:         req.Nome,
		Email:        req.Email,
		Username:     req.Username,
		Senha:        string(hashedPassword),
		AuthProvider: "local",
		Aprovado:     false, // Usuário não aprovado por padrão
		Role:         "user", // Role padrão
		CriadoEm:     time.Now(),
		AtualizadoEm: time.Now(),
	}

	err = s.userRepo.CreateUser(user)
	if err != nil {
		return nil, err
	}

	return &model.RegisterResponse{
		Success: true,
		Message: "Usuário registrado com sucesso",
		User:    user,
	}, nil
}

func (s *authService) Login(req model.LoginRequest) (*model.LoginResponse, error) {
	// Buscar usuário por username
	var user *model.User
	var err error

	if req.Username != "" {
		user, err = s.userRepo.FindUserByUsername(req.Username)
	} else {
		return nil, errors.New("username é obrigatório")
	}

	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("usuário não encontrado")
	}

	// Verificar se o usuário está aprovado
	if !user.Aprovado && user.Role != "admin" {
		return nil, errors.New("usuário aguardando aprovação de administrador")
	}

	// Verificar senha apenas para usuários locais
	if user.AuthProvider == "local" {
		err = bcrypt.CompareHashAndPassword([]byte(user.Senha), []byte(req.Senha))
		if err != nil {
			log.Printf("Erro na comparação de senhas para o usuário %s: %v", user.Username, err)
			return nil, errors.New("senha incorreta")
		}
	}

	// Criar sessão
	token, expiresAt, err := s.createSession(user.ID)
	if err != nil {
		return nil, err
	}

	return &model.LoginResponse{
		Success:   true,
		Message:   "Login realizado com sucesso",
		User:      user,
		Token:     token,
		ExpiresAt: expiresAt.Unix(),
	}, nil
}

func (s *authService) LoginWithGoogle(googleID, email, nome, picture string) (*model.LoginResponse, error) {
	// Buscar usuário existente por Google ID
	user, err := s.userRepo.FindUserByGoogleID(googleID)
	if err != nil {
		return nil, err
	}

	// Se não encontrou por Google ID, buscar por email
	if user == nil {
		user, err = s.userRepo.FindUserByEmail(email)
		if err != nil {
			return nil, err
		}
	}

	// Se usuário não existe, criar novo
	if user == nil {
		user = &model.User{
			ID:           primitive.NewObjectID(),
			Nome:         nome,
			Email:        email,
			GoogleID:     googleID,
			Picture:      picture,
			AuthProvider: "google",
			CriadoEm:     time.Now(),
			AtualizadoEm: time.Now(),
		}

		err = s.userRepo.CreateUser(user)
		if err != nil {
			return nil, err
		}
	} else {
		// Atualizar informações do Google se necessário
		updated := false
		if user.GoogleID != googleID {
			user.GoogleID = googleID
			updated = true
		}
		if user.Picture != picture {
			user.Picture = picture
			updated = true
		}
		if user.Nome != nome {
			user.Nome = nome
			updated = true
		}

		if updated {
			err = s.userRepo.UpdateUser(user)
			if err != nil {
				return nil, err
			}
		}
	}

	// Criar sessão
	token, expiresAt, err := s.createSession(user.ID)
	if err != nil {
		return nil, err
	}

	return &model.LoginResponse{
		Success:   true,
		Message:   "Login realizado com sucesso",
		User:      user,
		Token:     token,
		ExpiresAt: expiresAt.Unix(),
	}, nil
}

func (s *authService) ValidateSession(token string) (*model.User, error) {
	session, err := s.sessionRepo.GetSessionByToken(token)
	if err != nil {
		return nil, err
	}
	if session == nil {
		return nil, errors.New("sessão inválida ou expirada")
	}

	// Buscar usuário por ID
	user, err := s.userRepo.FindUserByID(session.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, errors.New("usuário não encontrado")
	}

	return user, nil
}

func (s *authService) Logout(token string) error {
	return s.sessionRepo.DeleteSession(token)
}

func (s *authService) CleanupExpiredSessions() error {
	return s.sessionRepo.DeleteExpiredSessions()
}

func (s *authService) GetAuthURL(state string) string {
	return s.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

func (s *authService) ExchangeCodeForToken(code string) (*oauth2.Token, error) {
	return s.oauthConfig.Exchange(context.Background(), code)
}

func (s *authService) GetUserInfo(token *oauth2.Token) (*GoogleUserInfo, error) {
	client := s.oauthConfig.Client(context.Background(), token)
	
	oauth2Service, err := oauth2v2.NewService(context.Background(), option.WithHTTPClient(client))
	if err != nil {
		return nil, fmt.Errorf("erro ao criar serviço OAuth2: %v", err)
	}

	userInfo, err := oauth2Service.Userinfo.Get().Do()
	if err != nil {
		return nil, fmt.Errorf("erro ao obter informações do usuário: %v", err)
	}

	verifiedEmail := false
	if userInfo.VerifiedEmail != nil {
		verifiedEmail = *userInfo.VerifiedEmail
	}

	return &GoogleUserInfo{
		ID:            userInfo.Id,
		Email:         userInfo.Email,
		VerifiedEmail: verifiedEmail,
		Name:          userInfo.Name,
		GivenName:     userInfo.GivenName,
		FamilyName:    userInfo.FamilyName,
		Picture:       userInfo.Picture,
		Locale:        userInfo.Locale,
	}, nil
}

func (s *authService) createSession(userID primitive.ObjectID) (string, time.Time, error) {
	// Gerar token aleatório
	bytes := make([]byte, 32)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", time.Time{}, err
	}
	token := hex.EncodeToString(bytes)

	// Definir expiração (30 minutos)
	expiresAt := time.Now().Add(30 * time.Minute)

	// Criar sessão
	session := model.Session{
		ID:        primitive.NewObjectID(),
		UserID:    userID,
		Token:     token,
		ExpiresAt: expiresAt,
		CriadoEm:  time.Now(),
	}

	err = s.sessionRepo.CreateSession(session)
	if err != nil {
		return "", time.Time{}, err
	}

	log.Printf("Sessão criada com token: %s, expira em: %v", token, expiresAt)
	return token, expiresAt, nil
}