# 在线游戏框架 (Online Game Framework)

一个基于 TSRPC 和 Cocos Creator 的多人实时在线游戏框架，支持房间管理、用户认证、帧同步和实时聊天等功能。

> **项目说明**: 本项目基于 [TSRPC](https://tsrpc.cn/) 框架开发，并使用 [Cursor AI](https://cursor.sh/) 辅助开发。感谢这两个优秀的工具为项目开发提供的强大支持！

## 🔗 相关链接

-   **TSRPC 官方文档**: https://tsrpc.cn/
-   **Cursor AI 官网**: https://cursor.com/home
-   **Cocos Creator**: https://www.cocos.com/creator

## 📚 参考项目

-   https://gitee.com/fengssy/ts-gameframework
-   https://gitee.com/fengssy/tsgf-demos
-   https://gitee.com/tsrpcx/ts-gameframework

## 🎮 项目概述

本项目是一个完整的多人在线游戏解决方案，包含：

-   **后端服务**: 基于 TSRPC 的微服务架构，支持用户认证、房间管理、帧同步
-   **前端游戏**: 基于 Cocos Creator 的游戏客户端，支持实时多人游戏
-   **数据库**: MySQL + Redis 的数据存储方案
-   **容器化**: Docker 一键部署

## ✨ 核心功能

### 🎯 游戏功能

-   **多人房间系统**: 创建、加入、离开房间
-   **实时帧同步**: 60fps 的确定性同步，支持断线重连
-   **用户颜色系统**: 智能颜色分配，每个用户独特颜色
-   **实时聊天**: 房间内实时文字聊天
-   **准备系统**: 用户准备状态管理，支持游戏开始控制

### 🔐 用户系统

-   **用户认证**: 支持用户名密码登录和 SSO Token
-   **用户管理**: 用户注册、登录、权限管理
-   **状态跟踪**: 实时跟踪用户房间状态

### 🏗️ 技术特性

-   **微服务架构**: 用户服务、匹配服务、房间服务分离
-   **实时通信**: WebSocket 长连接
-   **类型安全**: 完整的 TypeScript 类型定义
-   **容器化部署**: Docker Compose 一键启动

## 🚀 快速开始

### 环境要求

-   Node.js 16+
-   Docker & Docker Compose
-   Cocos Creator 3.x (前端开发)

### 1. 克隆项目

```bash
git clone <repository-url>
cd online-game-framework
```

### 2. 启动数据库服务

```bash
# 启动 Redis 和 MySQL 服务
cd backend
./scripts/start-docker.sh

# 或者手动启动
docker-compose up -d
```

### 3. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

后端服务将在以下端口启动：

-   用户服务: http://localhost:3001
-   匹配服务: http://localhost:3004
-   房间服务: http://localhost:3005

### 4. 启动前端游戏

1. 使用 Cocos Creator 打开 `frontend` 目录
2. 在编辑器中运行项目
3. 或者使用预览模式

## 📊 数据库管理

-   **phpMyAdmin**: http://localhost:8080
-   **Redis Commander**: http://localhost:8081

默认数据库配置：

-   MySQL: `gameonline` / `gameonline123`
-   Redis: 无密码

## 🏗️ 项目架构

### 后端架构

```
backend/
├── src/
│   ├── UserServer/          # 用户服务
│   │   ├── api/            # 用户相关API
│   │   └── UserServer.ts   # 用户服务主类
│   ├── MatchServer/        # 匹配服务
│   │   ├── api/            # 匹配相关API
│   │   └── MatchServer.ts  # 匹配服务主类
│   ├── RoomServer/         # 房间服务
│   │   ├── api/            # 房间相关API
│   │   ├── models/         # 房间模型
│   │   └── RoomServer.ts   # 房间服务主类
│   ├── services/           # 共享服务
│   │   ├── AuthService.ts  # 认证服务
│   │   ├── UserService.ts  # 用户服务
│   │   ├── RoomStateService.ts # 房间状态服务
│   │   └── FrameSyncService.ts # 帧同步服务
│   ├── shared/             # 共享类型和协议
│   │   ├── protocols/      # API协议定义
│   │   └── types/          # 类型定义
│   └── utils/              # 工具类
│       └── ColorGenerator.ts # 颜色生成器
├── scripts/                # 脚本文件
│   ├── init.sql           # 数据库初始化
│   ├── start-docker.sh    # 启动Docker服务
│   └── stop-docker.sh     # 停止Docker服务
└── docker-compose.yml     # Docker配置
```

### 前端架构

```
frontend/
├── assets/
│   └── scripts/
│       ├── LoginPanel.ts      # 登录界面
│       ├── MatchTest.ts       # 匹配测试
│       ├── RoomTest.ts        # 房间管理
│       ├── GameTest.ts        # 游戏逻辑
│       └── shared/            # 共享代码
│           ├── protocols/     # 协议定义
│           ├── services/      # 服务类
│           └── types/         # 类型定义
├── library/                   # Cocos Creator资源
└── settings/                  # 项目设置
```

## 🎮 游戏功能详解

### 帧同步系统

本项目实现了完整的帧同步系统，支持多人实时游戏：

#### 特性

-   **60fps 同步**: 高频率的游戏状态同步
-   **确定性同步**: 确保所有客户端行为一致
-   **断线重连**: 支持状态同步和快速追帧
-   **输入处理**: 统一的输入操作处理机制

#### 使用方法

1. **发送输入**:

```typescript
// 在 GameTest 中
this.sendInput("Move", {
	x: 100,
	y: 200,
	timestamp: Date.now(),
});
```

2. **处理输入**:

```typescript
const inputHandler: InputHandler = {
	execInput_Move: (connId: string, inputFrame: any, dt: number) => {
		// 处理移动逻辑
	},
	execInput_Attack: (connId: string, inputFrame: any, dt: number) => {
		// 处理攻击逻辑
	},
};
```

### 用户颜色系统

智能的颜色分配系统，为每个用户生成独特且美观的颜色：

#### 特性

-   **预定义调色板**: 12 种精心挑选的美观颜色
-   **智能分配**: 避免颜色重复，优先使用预定义颜色
-   **颜色回收**: 用户离开时自动释放颜色
-   **随机生成**: 当预定义颜色用完后生成 HSV 色彩空间的随机颜色

#### 颜色类型

-   粉红色、蓝色、黄色、青色
-   紫色、橙色、灰色、靛蓝色
-   洋红色、绿色、珊瑚色、紫罗兰色

### 房间系统

完整的多人房间管理：

#### 功能

-   **房间创建**: 支持自定义房间名称
-   **房间加入**: 通过房间 ID 加入
-   **用户管理**: 房主权限、用户列表
-   **准备系统**: 所有用户准备后开始游戏
-   **实时聊天**: 房间内文字聊天

#### 状态管理

-   **用户状态跟踪**: 实时跟踪用户所在房间
-   **状态清理**: 自动清理无效的房间状态
-   **断线处理**: 优雅处理用户断线情况

## 🛠️ 开发指南

### 后端开发

#### 添加新的 API

1. 在对应的服务目录下创建 API 文件
2. 定义请求和响应类型
3. 实现 API 逻辑
4. 更新服务协议

#### 添加新的服务

1. 创建服务目录和主类
2. 实现服务接口
3. 注册到主服务器
4. 添加 Docker 配置

### 前端开发

#### 添加新的游戏功能

1. 在 `GameTest.ts` 中添加游戏逻辑
2. 实现输入处理
3. 更新 UI 界面
4. 处理网络消息

#### 添加新的 UI 组件

1. 在 Cocos Creator 中创建 UI 预制体
2. 创建对应的 TypeScript 组件
3. 绑定事件处理
4. 集成到现有界面

### 数据库开发

#### 添加新的数据表

1. 在 `scripts/init.sql` 中添加表结构
2. 在 `models/Database.ts` 中添加类型定义
3. 创建对应的服务类
4. 更新 API 接口

## 📝 API 文档

### 用户服务 API

-   `POST /api/Login` - 用户登录
-   `POST /api/Register` - 用户注册
-   `POST /api/RefreshToken` - 刷新 Token

### 匹配服务 API

-   `POST /api/CreateRoom` - 创建房间
-   `POST /api/StartMatch` - 开始匹配
-   `POST /api/StopMatch` - 停止匹配

### 房间服务 API

-   `POST /api/JoinRoom` - 加入房间
-   `POST /api/ExitRoom` - 离开房间
-   `POST /api/SetReady` - 设置准备状态
-   `POST /api/SendInput` - 发送游戏输入
-   `POST /api/SendChat` - 发送聊天消息

## 🔧 配置说明

### 环境变量

创建 `.env` 文件：

```bash
# MySQL 配置
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

# 服务端口
USER_SERVER_PORT=3001
MATCH_SERVER_PORT=3004
ROOM_SERVER_PORT=3005
```

### Docker 配置

修改 `docker-compose.yml` 调整服务配置：

```yaml
services:
    mysql:
        image: mysql:8.0
        environment:
            MYSQL_ROOT_PASSWORD: root123
            MYSQL_DATABASE: gameonline
            MYSQL_USER: gameonline
            MYSQL_PASSWORD: gameonline123
        ports:
            - "3306:3306"
        volumes:
            - ./scripts/init.sql:/docker-entrypoint-initdb.d/init.sql
```

## 🚀 部署指南

### 开发环境

```bash
# 启动所有服务
cd backend
./scripts/start-docker.sh
npm run dev

# 前端开发
cd frontend
# 在 Cocos Creator 中打开项目
```

### 生产环境

```bash
# 构建后端
cd backend
npm run build

# 使用 Docker 部署
docker-compose -f docker-compose.prod.yml up -d
```

## 🧪 测试

### 运行测试

```bash
# 后端测试
cd backend
npm run test

# 前端测试
cd frontend
# 在 Cocos Creator 中运行测试场景
```

### 测试场景

1. **用户认证测试**: 注册、登录、Token 刷新
2. **房间功能测试**: 创建、加入、离开房间
3. **帧同步测试**: 多人游戏同步测试
4. **聊天功能测试**: 实时消息发送和接收

## 🐛 故障排除

### 常见问题

1. **数据库连接失败**

    - 检查 Docker 服务是否启动
    - 验证环境变量配置
    - 查看数据库日志

2. **帧同步不同步**

    - 检查网络连接
    - 验证输入处理逻辑
    - 查看控制台日志

3. **用户颜色不显示**
    - 检查颜色数据传递
    - 验证前端颜色设置
    - 查看网络消息

### 日志查看

```bash
# 查看 Docker 服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f mysql
docker-compose logs -f redis
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

-   创建 Issue
-   发送邮件
-   提交 Pull Request

---

**注意**: 这是一个开发中的项目，某些功能可能还在完善中。欢迎贡献代码和提出建议！
