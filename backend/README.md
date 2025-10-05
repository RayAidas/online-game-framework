# GameOnline Backend Server

基于 TSRPC 的在线游戏后端服务，使用 Redis 存储登录信息，MySQL 存储用户数据。

## 🚀 快速开始

### 1. 启动数据库服务

使用 Docker 启动 Redis 和 MySQL 服务：

```bash
# 启动数据库服务
./scripts/start-docker.sh

# 或者手动启动
docker-compose up -d
```

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 配置环境变量

创建 `.env` 文件（参考 `.env.example`）：

```bash
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
```

### 4. 启动开发服务器

```bash
npm run dev
```

## 📊 数据库管理

-   **phpMyAdmin**: http://localhost:8080
-   **Redis Commander**: http://localhost:8081

## 🛠️ 开发命令

### 本地开发服务器

开发服务器会在代码更改时自动重启。

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

### 生成 API 文档

生成 swagger/openapi 和 markdown 格式的 API 文档。

```bash
npm run doc
```

### 运行单元测试

先执行 `npm run dev`，然后执行：

```bash
npm run test
```

## 🐳 Docker 服务

### 启动服务

```bash
./scripts/start-docker.sh
```

### 停止服务

```bash
./scripts/stop-docker.sh
```

### 查看服务状态

```bash
docker-compose ps
```

### 查看日志

```bash
docker-compose logs -f
```

## 📁 项目结构

```
backend/
├── src/
│   ├── models/
│   │   ├── Database.ts      # 数据库连接配置
│   │   └── UserUtil.ts      # 用户工具类
│   ├── api/                 # API 接口
│   └── shared/              # 共享类型和协议
├── scripts/
│   └── init.sql            # 数据库初始化脚本
└── docker-compose.yml      # Docker 服务配置
```

## 🔧 技术栈

-   **框架**: TSRPC
-   **数据库**: MySQL 8.0
-   **缓存**: Redis 7
-   **容器化**: Docker & Docker Compose
-   **语言**: TypeScript

---
