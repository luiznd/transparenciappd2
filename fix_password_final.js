db = db.getSiblingDB('portalDB');

// Atualizar a senha do usuário luiznd com o hash correto para "admin123"
var result = db.users.updateOne(
    { username: "luiznd" },
    { 
        $set: { 
            senha: "$2a$10$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy",
            atualizadoEm: new Date()
        }
    }
);

print("Senha do usuário luiznd atualizada com sucesso!");
print("Modificados: " + result.modifiedCount + " documentos");