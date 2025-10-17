/*
 Navicat Premium Data Transfer

 Source Server         : xpack-open-dev
 Source Server Type    : MySQL
 Source Server Version : 80405 (8.4.5)
 Source Host           : localhost:3306
 Source Schema         : xpack

 Target Server Type    : MySQL
 Target Server Version : 80405 (8.4.5)
 File Encoding         : utf8mb4

 Date: 19/07/2025 23:32:04
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, user UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'User name',
  `email` VARCHAR(255) NOT NULL COMMENT 'User email address',
  `password` VARCHAR(255) DEFAULT NULL COMMENT 'Hashed password (MD5, 32 characters)',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT 'User avatar URL',
  `is_active` TINYINT NOT NULL DEFAULT 1 COMMENT 'User status: 0 (inactive), 1 (active)',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT 'Logical deletion: 0 (normal), 1 (deleted)',
  `register_type` ENUM('google', 'email','inner') NOT NULL COMMENT 'Registration method: google or email',
  `role_id` INT NOT NULL COMMENT 'Role ID: 1 (admin), 2 (user)',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Last login timestamp',
  `last_login_ip` VARCHAR(255) DEFAULT NULL COMMENT 'Last login IP address',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_email` (`email`) COMMENT 'Unique email index'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores user information and status';

ALTER TABLE `user` 
MODIFY COLUMN `register_type` ENUM('google', 'email', 'inner') NOT NULL COMMENT 'Registration method';
-- ----------------------------
-- Table structure for user_access_token
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_access_token` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, token UUID',
  `user_id` CHAR(36) NOT NULL COMMENT 'User UUID',
  `token` VARCHAR(255) NOT NULL COMMENT 'Access token',
  `expire_at` TIMESTAMP NOT NULL COMMENT 'Token expiration timestamp',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_token` (`token`) COMMENT 'Unique token index',
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores user authentication tokens';

-- ----------------------------
-- Table structure for user_apikey
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_apikey` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, API key UUID',
  `user_id` CHAR(36) NOT NULL COMMENT 'User UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'API key name',
  `description` TEXT DEFAULT NULL COMMENT 'API key description',
  `apikey` VARCHAR(255) NOT NULL COMMENT 'API key value',
  `expire_at` TIMESTAMP NULL DEFAULT NULL COMMENT 'Expiration timestamp',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_apikey` (`apikey`) COMMENT 'Unique API key index',
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores user API keys';

-- ----------------------------
-- Table structure for user_wallet
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_wallet` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, wallet UUID',
  `user_id` CHAR(36) NOT NULL COMMENT 'User UUID',
  `balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Wallet balance',
  `frozen_balance` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Frozen balance',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_user_id` (`user_id`) COMMENT 'Unique user ID index',
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores user wallet balance information';

-- ----------------------------
-- Table structure for user_wallet_history
-- ----------------------------
CREATE TABLE IF NOT EXISTS `user_wallet_history` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, transaction UUID',
  `user_id` CHAR(36) NOT NULL COMMENT 'User UUID',
  `payment_method` ENUM('platform', 'stripe', 'alipay', 'wechat') NOT NULL COMMENT 'Payment method',
  `amount` DECIMAL(10,2) NOT NULL COMMENT 'Transaction amount (positive: deposit, negative: withdrawal)',
  `balance_after` DECIMAL(10,2) NOT NULL COMMENT 'Balance after transaction',
  `type` ENUM('deposit', 'consume', 'refund', 'api_call') NOT NULL COMMENT 'Transaction type',
  `status` TINYINT NOT NULL COMMENT 'Status: 0 (created), 1 (completed), 2 (pending)',
  `transaction_id` VARCHAR(255) DEFAULT NULL COMMENT 'Payment platform transaction ID',
  `channel_user_id` VARCHAR(255) DEFAULT NULL COMMENT 'Payment channel user ID',
  `callback_data` TEXT DEFAULT NULL COMMENT 'Payment callback data',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_transaction_id` (`transaction_id`, `type`) COMMENT 'Unique transaction ID index',
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores user wallet transaction history';

-- ----------------------------
-- Table structure for payment_channel
-- ----------------------------
CREATE TABLE IF NOT EXISTS `payment_channel` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, channel UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'Channel name',
  `status` TINYINT NOT NULL DEFAULT 0 COMMENT 'Status: 0 (disabled), 1 (enabled)',
  `config` TEXT DEFAULT NULL COMMENT 'Configuration details',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores payment channel configurations';

-- ----------------------------
-- Table structure for sys_config
-- ----------------------------
CREATE TABLE IF NOT EXISTS `sys_config` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, configuration UUID',
  `key` VARCHAR(255) NOT NULL COMMENT 'Configuration key',
  `value` TEXT NOT NULL COMMENT 'Configuration value',
  `description` TEXT NOT NULL COMMENT 'Configuration description',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_key` (`key`) COMMENT 'Unique configuration key index'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores system configuration parameters';

-- ----------------------------
-- Table structure for mcp_service
-- ----------------------------
CREATE TABLE IF NOT EXISTS `mcp_service` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, service UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'Service name',
  `slug_name` VARCHAR(255) NOT NULL COMMENT 'Unique service identifier (slug format)',
  `short_description` TEXT NOT NULL COMMENT 'Brief service description',
  `long_description` LONGTEXT DEFAULT NULL COMMENT 'Detailed service description (Markdown)',
  `base_url` VARCHAR(512) DEFAULT NULL COMMENT 'Service base URL',
  `auth_method` ENUM('free', 'apikey', 'token') NOT NULL COMMENT 'Authentication method',
  `auth_header` VARCHAR(255) DEFAULT NULL COMMENT 'Authentication header name',
  `auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Authentication token value',
  `charge_type` ENUM('free', 'per_call', 'per_token') NOT NULL COMMENT 'Billing method',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Service price',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT 'Status: 0 (disabled), 1 (enabled)',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT 'Service tags',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_slug_name` (`slug_name`) COMMENT 'Unique slug name index'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores MCP service information and configurations';

-- ----------------------------
-- Table structure for temp_mcp_service
-- ----------------------------
CREATE TABLE IF NOT EXISTS `temp_mcp_service` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, temporary service UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'Service name',
  `slug_name` VARCHAR(255) NOT NULL COMMENT 'Unique service identifier (slug format)',
  `short_description` TEXT NOT NULL COMMENT 'Brief service description',
  `long_description` LONGTEXT DEFAULT NULL COMMENT 'Detailed service description (Markdown)',
  `base_url` VARCHAR(512) DEFAULT NULL COMMENT 'Service base URL',
  `auth_method` ENUM('free', 'apikey', 'token') NOT NULL COMMENT 'Authentication method',
  `auth_header` VARCHAR(255) DEFAULT NULL COMMENT 'Authentication header name',
  `auth_token` VARCHAR(255) DEFAULT NULL COMMENT 'Authentication token value',
  `charge_type` ENUM('free', 'per_call', 'per_token') NOT NULL COMMENT 'Billing method',
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT 'Service price',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT 'Status: 0 (disabled), 1 (enabled)',
  `tags` VARCHAR(255) DEFAULT NULL COMMENT 'Service tags',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_slug_name` (`slug_name`) COMMENT 'Unique slug name index'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores temporary MCP service information';

-- ----------------------------
-- Table structure for mcp_tool_api
-- ----------------------------
CREATE TABLE IF NOT EXISTS `mcp_tool_api` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, tool UUID',
  `service_id` CHAR(36) NOT NULL COMMENT 'MCP service UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'API name',
  `description` TEXT NOT NULL COMMENT 'API description',
  `path` VARCHAR(512) NOT NULL COMMENT 'API request path',
  `method` ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL COMMENT 'HTTP request method',
  `path_parameters` TEXT DEFAULT NULL COMMENT 'Path parameters definition',
  `query_parameters` TEXT DEFAULT NULL COMMENT 'Query parameters definition',
  `header_parameters` TEXT DEFAULT NULL COMMENT 'Header parameters definition',
  `request_body_schema` TEXT DEFAULT NULL COMMENT 'Request body schema (JSON)',
  `response_schema` TEXT DEFAULT NULL COMMENT 'Response schema (JSON)',
  `response_examples` TEXT DEFAULT NULL COMMENT 'Response examples (JSON)',
  `response_headers` TEXT DEFAULT NULL COMMENT 'Response headers definition',
  `operation_examples` TEXT DEFAULT NULL COMMENT 'API operation examples',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT 'Status: 0 (disabled), 1 (enabled)',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT 'Logical deletion: 0 (normal), 1 (deleted)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`service_id`) REFERENCES `mcp_service` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores MCP tool API configurations';

-- ----------------------------
-- Table structure for temp_mcp_tool_api
-- ----------------------------
CREATE TABLE IF NOT EXISTS `temp_mcp_tool_api` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, temporary tool UUID',
  `service_id` CHAR(36) NOT NULL COMMENT 'MCP service UUID',
  `name` VARCHAR(255) NOT NULL COMMENT 'API name',
  `description` TEXT NOT NULL COMMENT 'API description',
  `path` VARCHAR(512) NOT NULL COMMENT 'API request path',
  `method` ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL COMMENT 'HTTP request method',
  `path_parameters` TEXT DEFAULT NULL COMMENT 'Path parameters definition',
  `query_parameters` TEXT DEFAULT NULL COMMENT 'Query parameters definition',
  `header_parameters` TEXT DEFAULT NULL COMMENT 'Header parameters definition',
  `request_body_schema` TEXT DEFAULT NULL COMMENT 'Request body schema (JSON)',
  `response_schema` TEXT DEFAULT NULL COMMENT 'Response schema (JSON)',
  `response_examples` TEXT DEFAULT NULL COMMENT 'Response examples (JSON)',
  `response_headers` TEXT DEFAULT NULL COMMENT 'Response headers definition',
  `operation_examples` TEXT DEFAULT NULL COMMENT 'API operation examples',
  `enabled` TINYINT NOT NULL DEFAULT 1 COMMENT 'Status: 0 (disabled), 1 (enabled)',
  `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT 'Logical deletion: 0 (normal), 1 (deleted)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores temporary MCP tool API configurations';

-- ----------------------------
-- Table structure for mcp_call_log
-- ----------------------------
CREATE TABLE IF NOT EXISTS `mcp_call_log` (
  `id` CHAR(36) NOT NULL COMMENT 'Primary key, call log UUID',
  `user_id` CHAR(36) NOT NULL COMMENT 'User UUID',
  `service_id` CHAR(36) NOT NULL COMMENT 'MCP service UUID',
  `api_id` CHAR(36) NOT NULL COMMENT 'API tool UUID',
  `tool_name` VARCHAR(200) NOT NULL COMMENT 'Tool name',
  `input_params` TEXT DEFAULT NULL COMMENT 'Input parameters (JSON)',
  `call_success` TINYINT NOT NULL COMMENT 'Call success: 0 (failed), 1 (successful)',
  `unit_price` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT 'Unit price per call',
  `actual_cost` DECIMAL(10,4) NOT NULL DEFAULT 0.0000 COMMENT 'Actual cost of call',
  `call_start_time` TIMESTAMP NOT NULL COMMENT 'Call start timestamp',
  `call_end_time` TIMESTAMP NULL DEFAULT NULL COMMENT 'Call end timestamp',
  `process_status` ENUM('pending', 'processed', 'failed') NOT NULL DEFAULT 'pending' COMMENT 'Processing status',
  `error_msg` TEXT DEFAULT NULL COMMENT 'Error message if call failed',
  `wallet_history_id` CHAR(36) DEFAULT NULL COMMENT 'Wallet history UUID',
  `apikey` VARCHAR(255) NOT NULL COMMENT 'API key used',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_service_id` (`service_id`),
  INDEX `idx_call_start_time` (`call_start_time`),
  INDEX `idx_process_status` (`process_status`),
  FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`service_id`) REFERENCES `mcp_service` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`api_id`) REFERENCES `mcp_tool_api` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`wallet_history_id`) REFERENCES `user_wallet_history` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Stores API call logs';

CREATE TABLE IF NOT EXISTS `sys_config_large` (
  `id` char(36) NOT NULL COMMENT 'Primary key, UUID',
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Configuration key name',
  `value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Configuration value',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Configuration item description',
  `created_at` timestamp NULL DEFAULT NULL COMMENT 'Record creation time',
  `updated_at` timestamp NULL DEFAULT NULL COMMENT 'Record last update time',
PRIMARY KEY (`id`) USING BTREE,
UNIQUE KEY `uk_key` (`key`) USING BTREE COMMENT 'Unique index for configuration key name'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC COMMENT='System configuration table for storing system-level configuration information';

INSERT INTO `user` (`id`, `name`, `email`, `password`, `is_active`, `is_deleted`, `register_type`, `role_id`, `created_at`, `updated_at`)
VALUES ('admin', 'admin', 'admin@xpack.com', '25f9e794323b453885f5181f1b624d0b', 1, 0, 'inner', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `register_type` = VALUES(`register_type`);

INSERT INTO `user_wallet` (`id`, `user_id`, `balance`, `frozen_balance`, `created_at`, `updated_at`)
SELECT UUID(), 'admin', 0.00, 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM `user_wallet` WHERE `user_id` = 'admin');

INSERT INTO `payment_channel` (`id`, `name`, `status`, `config`, `updated_at`)
SELECT 'stripe', 'Stripe', 1, '{\"secret\": \"\", \"webhook_secret\": \"\"}', '2025-07-17 06:42:55'
WHERE NOT EXISTS (SELECT 1 FROM `payment_channel` WHERE `id` = 'stripe');

INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`) 
VALUES ('xpack-version','version', '0.2.2', 'User wallet history max count', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS = 1;