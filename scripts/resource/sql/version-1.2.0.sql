SET FOREIGN_KEY_CHECKS=0;

CREATE TABLE `resource_group` (
  `id` char(36) NOT NULL COMMENT 'Primary key, group UUID',
  `name` varchar(255) NOT NULL COMMENT 'Group name',
  `description` text NULL COMMENT 'Group description',
  `enabled` tinyint NOT NULL DEFAULT 1 COMMENT 'Group status: 0=disabled, 1=enabled',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Resource group table';

CREATE TABLE `resource_group_service_map` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT 'Primary key',
  `group_id` char(36) NOT NULL COMMENT 'Resource group UUID',
  `service_id` char(36) NOT NULL COMMENT 'MCP service UUID',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_group_service` (`group_id`, `service_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Resource group to MCP service mapping';

ALTER TABLE `user` ADD `group_id` char(36) NULL COMMENT 'Resource group UUID';
UPDATE `user` SET `group_id` = 'allow-all' WHERE `group_id` IS NULL;

INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`)
VALUES ('xpack-resource-group-version','default_resource_group', 'allow-all', 'Default resource group for new users', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;


INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`)
VALUES ('xpack-version','version', '1.2.0', 'Add resource group tables', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;

SET FOREIGN_KEY_CHECKS=1;
