#! /bin/bash
echo "Start\n";
# 执行git命令
git pull

npm run build

pm2 restart ancient-server

echo "Success\n";
