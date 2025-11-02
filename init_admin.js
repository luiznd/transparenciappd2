// Script para criar usuário administrador
db = db.getSiblingDB('portalDB');

// Verificar se o usuário admin já existe
const adminExists = db.users.findOne({ username: "luiznd" });

if (!adminExists) {
  // Criar usuário administrador com senha hash (bcrypt)
  db.users.insertOne({
    nome: "Luiz Fernando",
    email: "luiznd@hotmail.com",
    username: "luiznd",
    // Hash da senha: rXSL43yvZcM71r (usando bcrypt)
    senha: "$2a$10$8KVj0xR7DFyPZnY1/XSqY.5vFyP.zED70YKI4rl4QO/fzX6/6UWPS",
    authProvider: "local",
    aprovado: true,
    role: "admin",
    criadoEm: new Date(),
    atualizadoEm: new Date()
  });
  
  print("Usuário administrador criado com sucesso!");
} else {
  print("Usuário administrador já existe!");
}