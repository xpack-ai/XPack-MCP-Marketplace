SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE `mcp_call_log` MODIFY COLUMN `process_status` enum('pending','processed','failed') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending' COMMENT 'Processing status: pending, processed, failed' AFTER `call_end_time`;

ALTER TABLE `mcp_service` ADD COLUMN `headers` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'headers config,like: [{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"}]' AFTER `auth_token`;

ALTER TABLE `mcp_service` ADD COLUMN `sort` int NOT NULL DEFAULT 0 COMMENT 'Sort. the larger, the higher' AFTER `tags`;

ALTER TABLE `mcp_service` ADD COLUMN `service_type` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Service type, optional values: openapi' AFTER `sort`;

UPDATE mcp_service
SET headers = CASE
  WHEN auth_method = 'apikey'
       AND COALESCE(auth_header, '') <> ''
       AND COALESCE(auth_token, '') <> ''
    THEN JSON_ARRAY(
      JSON_OBJECT(
        'name', auth_header,
        'value', auth_token,
        'description', 'auto migrate'
      )
    )
  WHEN auth_method = 'token'
       AND COALESCE(auth_token, '') <> ''
    THEN JSON_ARRAY(
      JSON_OBJECT(
        'name', 'Authorization',
        'value', CONCAT('Bearer ', auth_token),
        'description', 'auto migrate'
      )
    )
  ELSE JSON_ARRAY()
END;

-- ALTER TABLE `mcp_service` DROP COLUMN `auth_method`;
-- ALTER TABLE `mcp_service` DROP COLUMN `auth_header`;
-- ALTER TABLE `mcp_service` DROP COLUMN `auth_token`;


CREATE TABLE `onboarding_task`  (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `task_id` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Task ID',
  `user_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'User ID',
  `task_status` tinyint NOT NULL COMMENT 'Task status: 0 = incomplete, 1 = completed',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk`(`task_id` ASC, `user_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = 'Onboarding task table' ROW_FORMAT = DYNAMIC;

CREATE TABLE `stats_mcp_service_date` (
  `stats_date` datetime NOT NULL,
  `service_id` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `call_count` int NOT NULL DEFAULT '0' COMMENT 'Call count',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  UNIQUE KEY `uk_stats` (`stats_date`,`service_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci ROW_FORMAT=DYNAMIC;

ALTER TABLE `temp_mcp_service` ADD COLUMN `headers` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT 'Request headers configuration,[{\"name\":\"name\",\"value\":\"value\",\"description\":\"description\"}]' AFTER `auth_token`;

ALTER TABLE `temp_mcp_service` MODIFY COLUMN `id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'Primary key, service ID' FIRST;

ALTER TABLE `temp_mcp_service` MODIFY COLUMN `auth_method` enum('free','apikey','token') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Deprecated, authentication method: free, apikey, token' AFTER `base_url`;

ALTER TABLE `temp_mcp_service` MODIFY COLUMN `auth_header` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Deprecated, authentication header name' AFTER `auth_method`;

ALTER TABLE `temp_mcp_service` MODIFY COLUMN `auth_token` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT 'Deprecated, authentication token value' AFTER `auth_header`;

ALTER TABLE `temp_mcp_service` MODIFY COLUMN `input_token_price` decimal(10, 2) NULL DEFAULT NULL COMMENT 'Input token price' AFTER `price`;

ALTER TABLE `temp_mcp_service` MODIFY COLUMN `output_token_price` decimal(10, 2) NULL DEFAULT NULL COMMENT 'Output token price' AFTER `input_token_price`;

ALTER TABLE `user` MODIFY COLUMN `role_id` int NOT NULL COMMENT 'Role ID: 0 = unspecified, 1 = tenant, 2 = tenant user' AFTER `register_type`;

DELETE FROM sys_config WHERE `key` = "mcp_server_prefix";


INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`)
VALUES ('xpack-version','version', '1.1.0', 'User wallet history max count', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS=1;