// Script para corrigir a senha do usuário luiznd

// Conectar ao banco correto
db = db.getSiblingDB('portalDB');

// Atualizar a senha do usuário luiznd
db.users.updateOne(
    { username: "luiznd" },
    { 
        $set: { 
            senha: "$2a$10$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy",
            atualizadoEm: new Date()
        }
    }
);

print("Senha do usuário luiznd atualizada para 'admin123'");