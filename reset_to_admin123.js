// Resetar senha para admin123 com hash conhecido
db = db.getSiblingDB('portalDB');

// Hash bcrypt válido para "admin123"
var newHash = "$2a$10$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy";

var result = db.users.updateOne(
    { username: "luiznd" },
    { 
        $set: { 
            senha: newHash,
            atualizadoEm: new Date()
        }
    }
);

print("✅ Senha resetada para 'admin123'");
print("📝 Documentos modificados: " + result.modifiedCount);
print("🔑 Agora use: usuário=luiznd, senha=admin123");