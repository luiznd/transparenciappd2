// Script para resetar a senha do usuário luiznd
// A senha será resetada para "admin123" (hash bcrypt)

use portalDB;

db.users.updateOne(
  { username: "luiznd" },
  {
    $set: {
      senha: "$2a$10$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy"
    }
  }
);

print("Senha do usuário luiznd resetada com sucesso!");
print("Usuário: luiznd");
print("Senha: admin123");