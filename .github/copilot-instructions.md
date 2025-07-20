# XPack 开源版本 - Copilot 编程指导

## 项目架构

### 服务依赖
- `admin_service` 和 `api_service` 相互独立，都依赖 `common`
- 遵循分层架构：Controller → Service → Repository

### 目录结构
```
services/
├── admin_service/    # 管理端服务
├── api_service/      # API服务  
└── common/          # 公共模块
```

## 编码规范

### 代码风格
- 遵循 PEP 8，使用类型注解和 docstring
- 命名：函数/变量用 `snake_case`，类用 `PascalCase`
- 导入：优先使用 `services/common`，避免跨服务导入

### 日志要求
- **必须使用英文**，使用 `services/common/logging_config.py`
- 格式：`logger.info("Action completed: {context}")`
- 避免敏感信息，包含必要上下文

### 错误处理
- 使用 `services/common/error_msg.py` 定义的错误消息
- 统一异常处理和日志记录

## 开发建议
- 有适当的日志记录（英文格式，统一格式）
- 添加方法级别英文注释，需要简洁
- 添加的注释一律使用英文