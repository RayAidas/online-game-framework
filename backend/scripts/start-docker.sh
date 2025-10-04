#!/bin/bash

# 启动 Docker 容器脚本
echo "🚀 启动 GameOnline 数据库服务..."

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查 docker-compose 是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装，请先安装 docker-compose"
    exit 1
fi

# 创建环境变量文件（如果不存在）
if [ ! -f .env ]; then
    echo "📝 创建环境变量文件..."
    cat > .env << EOF
# MySQL 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=gameonline
MYSQL_PASSWORD=gameonline123
MYSQL_DATABASE=gameonline

# Redis 配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# 应用配置
NODE_ENV=development
PORT=3000
EOF
    echo "✅ 环境变量文件已创建"
fi

# 启动服务
echo "🐳 启动 Docker 容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📊 服务访问地址："
echo "   MySQL: localhost:3306"
echo "   Redis: localhost:6379"
echo "   phpMyAdmin: http://localhost:8080"
echo "   Redis Commander: http://localhost:8081"
echo ""
echo "🔑 数据库凭据："
echo "   用户名: gameonline"
echo "   密码: gameonline123"
echo "   数据库: gameonline"
echo ""
echo "🛑 停止服务: docker-compose stop"
echo "📋 查看日志: docker-compose logs -f"
