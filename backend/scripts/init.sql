-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS gameonline CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE gameonline;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    uid INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NULL,
    roles JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_uid (uid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认用户数据（使用加密密码）
INSERT IGNORE INTO users (username, password, roles) VALUES 
('Normal', '$2b$12$yX7jAA3GmhIQOuOSKMFOOOJfSRU15t7AVSm66KiMbYfkQw90DTwQO', '["Normal"]'),
('Admin', '$2b$12$vJZMgu/AZVyGa9ZZ5kR3SuB34VhTks6dALHL3ZZAnCJp0FpdEY5Ui', '["Admin"]'),
('TestUser', '$2b$12$tZc5jOHoPsCTQv.iXie9Yu8t3TvrST6p5EO8j.O1cxDXzC2AgUyHG', '["Normal", "Tester"]');

-- 创建游戏房间表（可选）
CREATE TABLE IF NOT EXISTS game_rooms (
    room_id INT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(100) NOT NULL,
    max_players INT DEFAULT 4,
    current_players INT DEFAULT 0,
    status ENUM('waiting', 'playing', 'finished') DEFAULT 'waiting',
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(uid) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建游戏记录表（可选）
CREATE TABLE IF NOT EXISTS game_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    player_uid INT,
    score INT DEFAULT 0,
    game_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES game_rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (player_uid) REFERENCES users(uid) ON DELETE CASCADE,
    INDEX idx_room_id (room_id),
    INDEX idx_player_uid (player_uid),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 显示创建的表
SHOW TABLES;
