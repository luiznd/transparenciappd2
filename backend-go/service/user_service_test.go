package service

import (
    "testing"
    "solid_react_golang_mongo_project/backend-go/model"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "golang.org/x/crypto/bcrypt"
)

// Reutiliza mockUserRepo de auth_service_test.go

func TestUpdateUserApproval(t *testing.T) {
    userRepo := newMockUserRepo()
    svc := NewUserService(userRepo)

    // usuário comum
    uid := primitive.NewObjectID()
    u := &model.User{ID: uid, Nome: "U1", Email: "u1@example.com", Role: "user", Aprovado: false}
    _ = userRepo.CreateUser(u)

    if err := svc.UpdateUserApproval(uid, true); err != nil {
        t.Fatalf("UpdateUserApproval falhou: %v", err)
    }
    got, _ := userRepo.FindUserByID(uid)
    if !got.Aprovado {
        t.Fatalf("esperava aprovado=true")
    }
}

func TestUpdateUserApproval_AdminBlocked(t *testing.T) {
    userRepo := newMockUserRepo()
    svc := NewUserService(userRepo)

    uid := primitive.NewObjectID()
    u := &model.User{ID: uid, Nome: "Admin", Email: "a@example.com", Role: "admin", Aprovado: true}
    _ = userRepo.CreateUser(u)

    if err := svc.UpdateUserApproval(uid, false); err == nil {
        t.Fatalf("esperava erro ao alterar status de admin")
    }
}

func TestUpdateUserRole(t *testing.T) {
    userRepo := newMockUserRepo()
    svc := NewUserService(userRepo)

    uid := primitive.NewObjectID()
    u := &model.User{ID: uid, Nome: "U2", Email: "u2@example.com", Role: "user"}
    _ = userRepo.CreateUser(u)

    if err := svc.UpdateUserRole(uid, "editor"); err != nil {
        t.Fatalf("UpdateUserRole falhou: %v", err)
    }
    got, _ := userRepo.FindUserByID(uid)
    if got.Role != "editor" {
        t.Fatalf("esperava role=editor, obtive %s", got.Role)
    }
}

func TestLoginUser_Success(t *testing.T) {
    userRepo := newMockUserRepo()
    svc := NewUserService(userRepo)

    hashed, _ := bcrypt.GenerateFromPassword([]byte("abc123"), bcrypt.DefaultCost)
    u := &model.User{ID: primitive.NewObjectID(), Nome: "Leo", Email: "l@example.com", Username: "leo", Senha: string(hashed)}
    _ = userRepo.CreateUser(u)

    resp, err := svc.LoginUser(&model.LoginRequest{Username: "leo", Senha: "abc123"})
    if err != nil || !resp.Success || resp.User == nil {
        t.Fatalf("LoginUser deveria ter sucesso: resp=%+v err=%v", resp, err)
    }
}