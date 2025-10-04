#!/bin/bash

# 停止 Docker 容器脚本
echo "🛑 停止 GameOnline 数据库服务..."

# 停止容器
docker-compose stop

echo "✅ 服务已停止"
