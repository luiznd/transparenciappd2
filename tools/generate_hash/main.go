package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Gerar novo hash para admin123
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Erro:", err)
		return
	}
	fmt.Printf("Novo hash: %s\n", string(hash))
	
	// Verificar que o hash funciona
	err = bcrypt.CompareHashAndPassword(hash, []byte("admin123"))
	if err != nil {
		fmt.Println("❌ Hash inválido:", err)
	} else {
		fmt.Println("✅ Hash válido para admin123")
	}
}