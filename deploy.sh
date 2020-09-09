#! /bin/bash
echo "Start\n";
# 执行git命令
git pull

# 生成api文档
npm run buildapi

pm2 restart ancient-server

echo "Success\n";

