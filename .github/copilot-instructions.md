# XPack Open Source Edition - Copilot Programming Guidelines

## Project Architecture

### Service Dependencies
- `admin_service` and `api_service` are independent of each other, both depend on `common`
- Follow layered architecture: Controller → Service → Repository

### Directory Structure
```
services/
├── admin_service/    # Admin service
├── api_service/      # API service  
└── common/          # Common modules
```

## Coding Standards

### Code Style
- Follow PEP 8, use type annotations and docstrings
- Naming: use `snake_case` for functions/variables, `PascalCase` for classes
- Imports: prioritize `services/common`, avoid cross-service imports

### Logging Requirements
- **Must use English**, use `services/common/logging_config.py`
- Format: `logger.info("Action completed: {context}")`
- Avoid sensitive information, include necessary context

### Error Handling
- Use error messages defined in `services/common/error_msg.py`
- Unified exception handling and logging

## Development Guidelines
- Think and analyze requirements first, wait for user confirmation before writing code
- Include appropriate logging (English format, consistent style)
- Add method-level English comments, keep them concise
- All comments must be written in English