package service

import (
	"solid_react_golang_mongo_project/backend-go/model"
	"solid_react_golang_mongo_project/backend-go/repository"
	"errors"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
	"time"
)

type UserService interface {
    GetUserByID(id primitive.ObjectID) (*model.User, error)
    GetAllUsers() ([]*model.User, error)
    UpdateUserApproval(id primitive.ObjectID, approved bool) error
    UpdateUserRole(id primitive.ObjectID, role string) error
}

type userService struct {
	userRepo repository.UserRepository
}

func NewUserService(userRepo repository.UserRepository) UserService {
	return &userService{
		userRepo: userRepo,
	}
}

// GetUserByID busca um usuário pelo ID
func (s *userService) GetUserByID(id primitive.ObjectID) (*model.User, error) {
	return s.userRepo.FindUserByID(id)
}

// GetAllUsers retorna todos os usuários
func (s *userService) GetAllUsers() ([]*model.User, error) {
	return s.userRepo.FindAllUsers()
}

// UpdateUserApproval atualiza o status de aprovação de um usuário
func (s *userService) UpdateUserApproval(id primitive.ObjectID, approved bool) error {
	user, err := s.userRepo.FindUserByID(id)
	if err != nil {
		return err
	}
	
	if user == nil {
		return errors.New("usuário não encontrado")
	}
	
	// Não permitir alterar status de administradores
	if user.Role == "admin" {
		return errors.New("não é possível alterar status de administradores")
	}
	
	user.Aprovado = approved
	user.AtualizadoEm = time.Now()
	
	return s.userRepo.UpdateUser(user)
}

// UpdateUserRole atualiza o papel (role) de um usuário (apenas admin pode chamar no controller)
func (s *userService) UpdateUserRole(id primitive.ObjectID, role string) error {
    user, err := s.userRepo.FindUserByID(id)
    if err != nil {
        return err
    }
    if user == nil {
        return errors.New("usuário não encontrado")
    }

    // Não permitir alterar role de administradores
    if user.Role == "admin" {
        return errors.New("não é possível alterar role de administradores")
    }

    // Validar roles permitidos
    allowed := map[string]bool{"user": true, "editor": true}
    if !allowed[role] {
        return errors.New("role inválido")
    }

    user.Role = role
    user.AtualizadoEm = time.Now()
    return s.userRepo.UpdateUser(user)
}
	


func (s *userService) LoginUser(loginReq *model.LoginRequest) (*model.LoginResponse, error) {
	// Buscar usuário pelo username
	user, err := s.userRepo.FindUserByUsername(loginReq.Username)
	if err != nil {
		return &model.LoginResponse{
			Success: false,
			Message: "Erro interno do servidor",
		}, err
	}
	
	if user == nil {
		return &model.LoginResponse{
			Success: false,
			Message: "Usuário não encontrado",
		}, nil
	}
	
	// Verificar senha
	err = bcrypt.CompareHashAndPassword([]byte(user.Senha), []byte(loginReq.Senha))
	if err != nil {
		return &model.LoginResponse{
			Success: false,
			Message: "Senha incorreta",
		}, nil
	}
	
	// Login bem-sucedido - não retornar a senha
	user.Senha = ""
	return &model.LoginResponse{
		Success: true,
		Message: "Login realizado com sucesso",
		User:    user,
	}, nil
}