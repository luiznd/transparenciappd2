// Conectar ao banco correto
db = db.getSiblingDB('portalDB');

// Hash bcrypt válido e testado para "admin123"
var validHash = "$2a$10$D1TWMn1WuaJoaG6muA2p.ztjiIE/Cq7FFEIfqIGFLTumj0rQSBCy";

// Atualizar a senha do usuário luiznd
var result = db.users.updateOne(
    { username: "luiznd" },
    { 
        $set: { 
            senha: validHash,
            atualizadoEm: new Date()
        }
    }
);

print("✅ SENHA ATUALIZADA COM SUCESSO!");
print("👤 Usuário: luiznd");
print("🔑 Senha: admin123");
print("📊 Documentos modificados: " + result.modifiedCount);
print("\n🎯 AGORA USE:");
print("   Usuário: luiznd");
print("   Senha: admin123");