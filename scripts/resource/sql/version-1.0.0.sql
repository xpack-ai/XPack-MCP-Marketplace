# mcp_call_log
ALTER TABLE `mcp_call_log` DROP COLUMN IF EXISTS `apikey`;
ALTER TABLE `mcp_call_log` ADD COLUMN `apikey_id` char(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT 'apikey_id' AFTER `wallet_history_id`;

# mcp_service
ALTER TABLE `mcp_service` ADD COLUMN `input_token_price` decimal(10, 2) NULL DEFAULT NULL COMMENT 'input token price' AFTER `price`;
ALTER TABLE `mcp_service` ADD COLUMN `output_token_price` decimal(10, 2) NULL DEFAULT NULL COMMENT 'output token price' AFTER `price`;

# temp_mcp_service
ALTER TABLE `temp_mcp_service` ADD COLUMN `input_token_price` decimal(10, 2) NULL DEFAULT NULL COMMENT 'input token price' AFTER `price`;
ALTER TABLE `temp_mcp_service` ADD COLUMN `output_token_price` decimal(10, 2) NULL DEFAULT NULL COMMENT 'output token price' AFTER `price`;

# user_wallet
ALTER TABLE `user_wallet` MODIFY COLUMN `balance` decimal(16, 6) NOT NULL COMMENT 'Wallet balance' AFTER `user_id`;
ALTER TABLE `user_wallet` MODIFY COLUMN `frozen_balance` decimal(16, 6) NOT NULL COMMENT 'Frozen balance' AFTER `balance`;

# user_wallet_history
ALTER TABLE `user_wallet_history` MODIFY COLUMN `amount` decimal(16, 6) NOT NULL COMMENT 'Change amount' AFTER `payment_method`;
ALTER TABLE `user_wallet_history` MODIFY COLUMN `balance_after` decimal(16, 6) NOT NULL COMMENT 'Balance after change' AFTER `amount`;

INSERT INTO `sys_config` (`id`,`key`, `value`,`description`,`created_at`,`updated_at`) 
VALUES ('xpack-version','version', '1.0.0', 'User wallet history max count', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `description` = VALUES(`description`), `updated_at` = CURRENT_TIMESTAMP;

