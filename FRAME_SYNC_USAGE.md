# 帧同步功能使用指南

## 概述

本项目已集成帧同步功能，支持多人实时游戏同步。帧同步是一种确定性同步技术，确保所有客户端在相同输入下产生相同结果。

## 功能特性

-   **服务端帧同步执行器**: 管理游戏帧的生成和广播
-   **客户端帧同步执行器**: 处理帧数据的接收和执行
-   **状态同步**: 支持断线重连时的快速追帧
-   **输入处理**: 统一的输入操作处理机制
-   **TypeScript 支持**: 完整的类型定义

## 架构说明

### 服务端 (Backend)

1. **FrameSyncService**: 服务端帧同步执行器

    - 位置: `backend/src/services/FrameSyncService.ts`
    - 负责收集客户端输入，按帧率生成同步帧

2. **Room 集成**: 房间自动启动帧同步

    - 位置: `backend/src/RoomServer/models/Room.ts`
    - 房间创建时自动启动帧同步服务

3. **API 接口**: 处理客户端输入
    - 位置: `backend/src/RoomServer/api/ApiSendInput.ts`
    - 接收客户端发送的输入操作

### 客户端 (Frontend)

1. **FrameSyncClient**: 客户端帧同步执行器

    - 位置: `frontend/assets/scripts/shared/services/FrameSyncClient.ts`
    - 处理服务端帧数据，执行游戏逻辑

2. **RoomTest 集成**: 房间页面集成帧同步
    - 位置: `frontend/assets/scripts/RoomTest.ts`
    - 自动初始化和管理帧同步客户端

## 使用方法

### 1. 发送输入操作

在客户端代码中，可以通过以下方式发送输入：

```typescript
// 在 RoomTest 组件中
this.sendInput("Move", {
	x: 100,
	y: 200,
	timestamp: Date.now(),
});

this.sendInput("Attack", {
	targetId: "enemy123",
	damage: 50,
});
```

### 2. 处理输入操作

在 `RoomTest.ts` 的 `initFrameSync()` 方法中，可以自定义输入处理器：

```typescript
const inputHandler: InputHandler = {
	execInput_Move: (connId: string, inputFrame: any, dt: number) => {
		// 处理移动输入
		console.log("玩家移动:", connId, inputFrame);
		// 在这里实现移动逻辑
	},
	execInput_Attack: (connId: string, inputFrame: any, dt: number) => {
		// 处理攻击输入
		console.log("玩家攻击:", connId, inputFrame);
		// 在这里实现攻击逻辑
	},
};
```

### 3. 处理每帧逻辑

在帧执行回调中处理游戏逻辑：

```typescript
(dt: number, frameIndex: number) => {
	// 每帧执行的游戏逻辑
	console.log("执行帧:", frameIndex, "时间间隔:", dt);
	// 在这里实现游戏状态更新、碰撞检测等
};
```

## 测试功能

### 测试按钮

在房间页面添加了测试按钮 `testFrameSyncButton`，点击可以发送随机移动输入来测试帧同步功能。

### 控制台日志

帧同步相关的操作都会在控制台输出日志，包括：

-   帧同步客户端初始化
-   输入操作发送和接收
-   帧执行过程
-   状态同步数据

## 配置选项

### 帧率设置

默认帧率为 60fps，可以在以下位置修改：

1. **服务端**: `FrameSyncService` 构造函数
2. **客户端**: `FrameSyncClient` 的 `serverSyncFrameRate` 属性

### 输入类型

可以定义任意输入类型，只需要在 `InputHandler` 中实现对应的 `execInput_<类型名>` 方法。

## 注意事项

1. **确定性**: 所有客户端必须使用相同的游戏逻辑，确保相同输入产生相同结果
2. **网络延迟**: 帧同步对网络延迟敏感，建议在局域网或低延迟环境下测试
3. **断线重连**: 支持状态同步，但需要实现 `getSyncState` 方法提供当前游戏状态
4. **性能优化**: 避免在帧同步中执行耗时操作，保持每帧执行时间稳定

## 扩展功能

### 添加新的输入类型

1. 在客户端发送时使用新的 `inputType`
2. 在 `InputHandler` 中添加对应的处理方法
3. 在服务端可以添加相应的验证逻辑

### 状态同步

实现 `getSyncState` 方法提供当前游戏状态，支持断线重连时的快速追帧。

### 自定义帧率

根据游戏需求调整帧率，平衡性能和同步精度。

## 故障排除

1. **帧同步未启动**: 检查房间是否正确创建，`startFrameSync()` 是否被调用
2. **输入未生效**: 检查 `InputHandler` 是否正确实现对应方法
3. **同步不一致**: 确保所有客户端使用相同的游戏逻辑和随机数种子
4. **性能问题**: 检查每帧执行时间，优化游戏逻辑

## 相关文件

-   服务端帧同步: `backend/src/services/FrameSyncService.ts`
-   客户端帧同步: `frontend/assets/scripts/shared/services/FrameSyncClient.ts`
-   房间集成: `frontend/assets/scripts/RoomTest.ts`
-   类型定义: `backend/src/shared/types/FrameSync.ts` 和 `frontend/assets/scripts/shared/types/FrameSync.ts`
