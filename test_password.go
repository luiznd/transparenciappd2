package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2a$10$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy"
	
	// Testar com admin123
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte("admin123"))
	if err != nil {
		fmt.Println("Senha NÃO corresponde:", err)
		
		// Testar variações comuns
		fmt.Println("\nTestando variações:")
		
		// Testar admin123 com diferentes casos
		testPasswords := []string{
			"admin123",
			"Admin123", 
			"ADMIN123",
			"admin123!",
			"admin",
			"123456",
			"password",
		}
		
		for _, pwd := range testPasswords {
			err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(pwd))
			if err == nil {
				fmt.Printf("✓ ENCONTRADA: '%s'\n", pwd)
				return
			}
		}
		fmt.Println("✗ Nenhuma variação corresponde")
		
	} else {
		fmt.Println("✓ Senha CORRESPONDE! admin123 está correto")
	}
}