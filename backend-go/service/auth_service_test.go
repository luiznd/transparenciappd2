package service

import (
    "testing"
    "time"
    "errors"
    "solid_react_golang_mongo_project/backend-go/model"
    "solid_react_golang_mongo_project/backend-go/repository"
    "golang.org/x/crypto/bcrypt"
    "go.mongodb.org/mongo-driver/bson/primitive"
)

// Mocks in-memory para os repositórios
type mockUserRepo struct {
    byID       map[primitive.ObjectID]*model.User
    byEmail    map[string]*model.User
    byUsername map[string]*model.User
    byGoogleID map[string]*model.User
}

func newMockUserRepo() *mockUserRepo {
    return &mockUserRepo{
        byID:       make(map[primitive.ObjectID]*model.User),
        byEmail:    make(map[string]*model.User),
        byUsername: make(map[string]*model.User),
        byGoogleID: make(map[string]*model.User),
    }
}

func (m *mockUserRepo) CreateUser(user *model.User) error {
    m.byID[user.ID] = user
    if user.Email != "" {
        m.byEmail[user.Email] = user
    }
    if user.Username != "" {
        m.byUsername[user.Username] = user
    }
    if user.GoogleID != "" {
        m.byGoogleID[user.GoogleID] = user
    }
    return nil
}

func (m *mockUserRepo) FindUserByUsername(username string) (*model.User, error) {
    return m.byUsername[username], nil
}

func (m *mockUserRepo) FindUserByEmail(email string) (*model.User, error) {
    return m.byEmail[email], nil
}

func (m *mockUserRepo) FindUserByGoogleID(googleID string) (*model.User, error) {
    return m.byGoogleID[googleID], nil
}

func (m *mockUserRepo) FindUserByID(id primitive.ObjectID) (*model.User, error) {
    return m.byID[id], nil
}

func (m *mockUserRepo) UpdateUser(user *model.User) error {
    m.byID[user.ID] = user
    if user.Email != "" {
        m.byEmail[user.Email] = user
    }
    if user.Username != "" {
        m.byUsername[user.Username] = user
    }
    if user.GoogleID != "" {
        m.byGoogleID[user.GoogleID] = user
    }
    return nil
}

func (m *mockUserRepo) FindAllUsers() ([]*model.User, error) {
    users := make([]*model.User, 0, len(m.byID))
    for _, u := range m.byID {
        users = append(users, u)
    }
    return users, nil
}

type mockSessionRepo struct {
    sessions map[string]model.Session
}

func newMockSessionRepo() *mockSessionRepo {
    return &mockSessionRepo{sessions: make(map[string]model.Session)}
}

func (m *mockSessionRepo) CreateSession(session model.Session) error {
    m.sessions[session.Token] = session
    return nil
}

func (m *mockSessionRepo) GetSessionByToken(token string) (*model.Session, error) {
    sess, ok := m.sessions[token]
    if !ok {
        return nil, nil
    }
    if time.Now().After(sess.ExpiresAt) {
        return nil, nil
    }
    return &sess, nil
}

func (m *mockSessionRepo) DeleteSession(token string) error {
    delete(m.sessions, token)
    return nil
}

func (m *mockSessionRepo) DeleteExpiredSessions() error {
    now := time.Now()
    for t, s := range m.sessions {
        if now.After(s.ExpiresAt) {
            delete(m.sessions, t)
        }
    }
    return nil
}

func (m *mockSessionRepo) DeleteUserSessions(userID primitive.ObjectID) error {
    for t, s := range m.sessions {
        if s.UserID == userID {
            delete(m.sessions, t)
        }
    }
    return nil
}

// Garantir que os mocks implementam as interfaces
var _ repository.UserRepository = (*mockUserRepo)(nil)
var _ repository.SessionRepository = (*mockSessionRepo)(nil)

func TestRegister_NewUser(t *testing.T) {
    userRepo := newMockUserRepo()
    sessRepo := newMockSessionRepo()
    svc := NewAuthService(userRepo, sessRepo)

    req := model.RegisterRequest{Nome: "Alice", Email: "alice@example.com", Username: "alice", Senha: "secret"}
    resp, err := svc.Register(req)
    if err != nil {
        t.Fatalf("esperava sucesso no registro, obtive erro: %v", err)
    }
    if !resp.Success || resp.User == nil {
        t.Fatalf("registro sem sucesso: %+v", resp)
    }
}

func TestRegister_DuplicateEmail(t *testing.T) {
    userRepo := newMockUserRepo()
    sessRepo := newMockSessionRepo()
    svc := NewAuthService(userRepo, sessRepo)

    // Usuário existente
    u := &model.User{ID: primitive.NewObjectID(), Nome: "Bob", Email: "bob@example.com", Username: "bob"}
    _ = userRepo.CreateUser(u)

    _, err := svc.Register(model.RegisterRequest{Nome: "Bob2", Email: "bob@example.com", Username: "bob2", Senha: "x"})
    if err == nil {
        t.Fatalf("esperava erro por email duplicado")
    }
}

func TestLogin_Success(t *testing.T) {
    userRepo := newMockUserRepo()
    sessRepo := newMockSessionRepo()
    svc := NewAuthService(userRepo, sessRepo)

    // criar usuário local aprovado
    hashed, _ := bcrypt.GenerateFromPassword([]byte("password"), bcrypt.DefaultCost)
    u := &model.User{ID: primitive.NewObjectID(), Nome: "Carol", Email: "c@example.com", Username: "carol", Senha: string(hashed), AuthProvider: "local", Aprovado: true}
    _ = userRepo.CreateUser(u)

    resp, err := svc.Login(model.LoginRequest{Username: "carol", Senha: "password"})
    if err != nil {
        t.Fatalf("login falhou: %v", err)
    }
    if !resp.Success || resp.Token == "" {
        t.Fatalf("esperava token válido, obtive: %+v", resp)
    }

    // validar sessão
    got, err := svc.ValidateSession(resp.Token)
    if err != nil || got == nil || got.ID != u.ID {
        t.Fatalf("ValidateSession falhou: got=%v err=%v", got, err)
    }
}

func TestLogin_NotApproved(t *testing.T) {
    userRepo := newMockUserRepo()
    sessRepo := newMockSessionRepo()
    svc := NewAuthService(userRepo, sessRepo)

    hashed, _ := bcrypt.GenerateFromPassword([]byte("pwd"), bcrypt.DefaultCost)
    u := &model.User{ID: primitive.NewObjectID(), Nome: "Dave", Email: "d@example.com", Username: "dave", Senha: string(hashed), AuthProvider: "local", Aprovado: false, Role: "user"}
    _ = userRepo.CreateUser(u)

    _, err := svc.Login(model.LoginRequest{Username: "dave", Senha: "pwd"})
    if err == nil || !errors.Is(err, errors.New("usuário aguardando aprovação de administrador")) {
        // apenas verificar que houve erro
        if err == nil {
            t.Fatalf("esperava erro de aprovação")
        }
    }
}

func TestLogout(t *testing.T) {
    userRepo := newMockUserRepo()
    sessRepo := newMockSessionRepo()
    svc := NewAuthService(userRepo, sessRepo)

    hashed, _ := bcrypt.GenerateFromPassword([]byte("pwd"), bcrypt.DefaultCost)
    u := &model.User{ID: primitive.NewObjectID(), Nome: "Eve", Email: "e@example.com", Username: "eve", Senha: string(hashed), AuthProvider: "local", Aprovado: true}
    _ = userRepo.CreateUser(u)

    resp, err := svc.Login(model.LoginRequest{Username: "eve", Senha: "pwd"})
    if err != nil {
        t.Fatalf("login falhou: %v", err)
    }
    if err := svc.Logout(resp.Token); err != nil {
        t.Fatalf("logout falhou: %v", err)
    }
    if s, _ := sessRepo.GetSessionByToken(resp.Token); s != nil {
        t.Fatalf("sessão deveria ter sido removida")
    }
}

func TestLoginWithGoogle_NewUser(t *testing.T) {
    userRepo := newMockUserRepo()
    sessRepo := newMockSessionRepo()
    svc := NewAuthService(userRepo, sessRepo)

    resp, err := svc.LoginWithGoogle("google-123", "g@example.com", "Gina", "pic.png")
    if err != nil {
        t.Fatalf("login google falhou: %v", err)
    }
    if !resp.Success || resp.Token == "" || resp.User == nil {
        t.Fatalf("esperava criação de usuário e token: %+v", resp)
    }
}