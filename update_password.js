// Atualizar a senha do usuário luiznd com um hash bcrypt válido para "admin123"
db = db.getSiblingDB('portalDB');

var newHash = "$2a$10$NL0jT7LKF5aREvSS.PBjMeJOR/u6bzaf4uT.Cpd9vv.Hh1CAZfhuu";

var result = db.users.updateOne(
  { username: "luiznd" },
  {
    $set: {
      senha: newHash,
      atualizadoEm: new Date()
    }
  }
);

print("✅ Senha do usuário 'luiznd' atualizada para 'admin123' com novo hash válido.");
print("📝 Documentos modificados: " + result.modifiedCount);