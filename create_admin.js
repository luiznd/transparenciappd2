// Script para criar usuário administrador
db = db.getSiblingDB('portalDB');

// Verificar se o usuário admin já existe
const adminExists = db.users.findOne({ username: "luiznd" });

if (!adminExists) {
  // Inserir usuário admin
  db.users.insertOne({
    nome: "Luiz Fernando",
    email: "luiznd@hotmail.com",
    username: "luiznd",
    senha: "$2a$10$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy", // senha: rXSL43yvZcM71r
    authProvider: "local",
    aprovado: true,
    role: "admin",
    criadoEm: new Date(),
    atualizadoEm: new Date()
  });
  
  print("Usuário administrador criado com sucesso!");
} else {
  // Atualizar usuário existente para ter permissões de admin
  db.users.updateOne(
    { username: "luiznd" },
    { 
      $set: { 
        aprovado: true, 
        role: "admin",
        atualizadoEm: new Date()
      } 
    }
  );
  
  print("Usuário administrador atualizado com sucesso!");
}