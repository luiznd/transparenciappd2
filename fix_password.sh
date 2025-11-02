#!/bin/bash
# Script para resetar a senha do usuário luiznd
docker-compose exec mongo mongosh -u root -p admin --authenticationDatabase admin portalDB --eval "db.users.updateOne({username: 'luiznd'}, {\$set: {senha: '\$2a\$10\$8KVxn4Aep8Qr.uFvOVVYxOiPQE.YOyh.K8QUEQHHfHlZVqFfxd8Vy'}})"