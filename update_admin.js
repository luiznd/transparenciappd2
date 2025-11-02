// Script para atualizar o usuário luiznd como administrador aprovado
db = db.getSiblingDB('portalDB');

// Atualizar o usuário luiznd para ser administrador e aprovado
const result = db.users.updateOne(
  { username: "luiznd" },
  { 
    $set: { 
      aprovado: true,
      role: "admin"
    } 
  },
  { upsert: false }
);

if (result.matchedCount > 0) {
  print("Usuário luiznd atualizado com sucesso como administrador aprovado!");
} else {
  print("Usuário luiznd não encontrado. Verifique o nome de usuário.");
}