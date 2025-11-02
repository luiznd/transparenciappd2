// Script para atualizar a senha do usuário admin 'luiznd' para 'admin123'
// Use com: mongosh -u root -p admin --authenticationDatabase admin /tmp/set_admin_password.js

db = db.getSiblingDB('portalDB');

var newHash = "$2a$10$4ChmRzu50yQgJzHN25ywPuSkPpOWpPFkKPYt..b28uJYysT2b2MwC";

var result = db.users.updateOne(
  { username: "luiznd" },
  {
    $set: {
      senha: newHash,
      atualizadoEm: new Date()
    }
  }
);

print("✅ Senha do usuário 'luiznd' atualizada.");
print("🔑 Nova senha: admin123");
print("📊 Documentos modificados: " + result.modifiedCount);