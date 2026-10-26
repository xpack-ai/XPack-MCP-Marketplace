ALTER TABLE `user_apikey` ADD COLUMN `is_deleted` TINYINT NOT NULL DEFAULT 0 COMMENT 'Logical deletion: 0 (normal), 1 (deleted)' AFTER `updated_at`;

INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`)
VALUES ('xpack-version','version', '1.4.0', 'Add is_deleted column to user_apikey', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;
