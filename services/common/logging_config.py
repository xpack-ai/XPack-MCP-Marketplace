"""
Unified logging configuration for XPack project
Supports different log levels and service-specific log files
"""

import os
import logging
import logging.handlers
from pathlib import Path
from typing import Optional


class LoggingConfig:
    """Unified logging configuration for XPack services"""
    
    # Default log format
    LOG_FORMAT = '%(asctime)s - [%(service_name)s] - [%(levelname)s] - [%(name)s] - %(message)s'
    DATE_FORMAT = '%Y-%m-%d %H:%M:%S'
    
    # Log levels mapping
    LOG_LEVELS = {
        'DEBUG': logging.DEBUG,
        'INFO': logging.INFO,
        'WARNING': logging.WARNING,
        'ERROR': logging.ERROR,
        'CRITICAL': logging.CRITICAL
    }
    
    def __init__(self, service_name: str):
        """
        Initialize logging configuration for a specific service
        
        Args:
            service_name: Name of the service (e.g., 'admin_service', 'api_service')
        """
        self.service_name = service_name
        self.log_level = self._get_log_level()
        self.log_to_file = self._get_log_to_file()
        self.max_size = self._get_max_size()
        self.backup_count = self._get_backup_count()
        
        # Create logs directory
        self.logs_dir = Path("logs") / service_name
        self.logs_dir.mkdir(parents=True, exist_ok=True)
        
        # Configure logging
        self._setup_logging()
    
    def _get_log_level(self) -> int:
        """Get log level from environment variable"""
        level_str = os.getenv("LOG_LEVEL", "INFO").upper()
        return self.LOG_LEVELS.get(level_str, logging.INFO)
    
    def _get_log_to_file(self) -> bool:
        """Get whether to log to file from environment variable"""
        return os.getenv("LOG_TO_FILE", "true").lower() == "true"
    
    def _get_max_size(self) -> int:
        """Get max log file size from environment variable (in MB)"""
        size_mb = int(os.getenv("LOG_MAX_SIZE", "10"))
        return size_mb * 1024 * 1024  # Convert to bytes
    
    def _get_backup_count(self) -> int:
        """Get backup count from environment variable"""
        return int(os.getenv("LOG_BACKUP_COUNT", "5"))
    
    def _setup_logging(self):
        """Setup logging configuration"""
        # Clear existing handlers
        root_logger = logging.getLogger()
        for handler in root_logger.handlers[:]:
            root_logger.removeHandler(handler)
        
        # Set root logger level
        root_logger.setLevel(self.log_level)
        
        # Create formatter
        formatter = logging.Formatter(self.LOG_FORMAT, self.DATE_FORMAT)
        
        # Add console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        root_logger.addHandler(console_handler)
        
        # Add file handlers if enabled
        if self.log_to_file:
            self._add_file_handlers(root_logger, formatter)
        
        # Set third-party library log levels
        self._configure_third_party_loggers()
        
        # Add service name to log records
        self._add_service_name_filter(root_logger)
    
    def _add_file_handlers(self, root_logger: logging.Logger, formatter: logging.Formatter):
        """Add file handlers for different log levels"""
        
        # Debug handler
        debug_handler = logging.handlers.RotatingFileHandler(
            self.logs_dir / "debug.log",
            maxBytes=self.max_size,
            backupCount=self.backup_count,
            encoding='utf-8'
        )
        debug_handler.setLevel(logging.DEBUG)
        debug_handler.setFormatter(formatter)
        debug_handler.addFilter(lambda record: record.levelno == logging.DEBUG)
        root_logger.addHandler(debug_handler)
        
        # Info handler
        info_handler = logging.handlers.RotatingFileHandler(
            self.logs_dir / "info.log",
            maxBytes=self.max_size,
            backupCount=self.backup_count,
            encoding='utf-8'
        )
        info_handler.setLevel(logging.INFO)
        info_handler.setFormatter(formatter)
        info_handler.addFilter(lambda record: record.levelno == logging.INFO)
        root_logger.addHandler(info_handler)
        
        # Warning handler
        warn_handler = logging.handlers.RotatingFileHandler(
            self.logs_dir / "warn.log",
            maxBytes=self.max_size,
            backupCount=self.backup_count,
            encoding='utf-8'
        )
        warn_handler.setLevel(logging.WARNING)
        warn_handler.setFormatter(formatter)
        warn_handler.addFilter(lambda record: record.levelno == logging.WARNING)
        root_logger.addHandler(warn_handler)
        
        # Error handler
        error_handler = logging.handlers.RotatingFileHandler(
            self.logs_dir / "error.log",
            maxBytes=self.max_size,
            backupCount=self.backup_count,
            encoding='utf-8'
        )
        error_handler.setLevel(logging.ERROR)
        error_handler.setFormatter(formatter)
        error_handler.addFilter(lambda record: record.levelno >= logging.ERROR)
        root_logger.addHandler(error_handler)
    
    def _configure_third_party_loggers(self):
        """Configure log levels for third-party libraries"""
        # Set third-party library log levels to reduce noise
        logging.getLogger('uvicorn').setLevel(logging.WARNING)
        logging.getLogger('starlette').setLevel(logging.WARNING)
        logging.getLogger('httpx').setLevel(logging.WARNING)
        logging.getLogger('pika').setLevel(logging.WARNING)
        logging.getLogger('sqlalchemy').setLevel(logging.WARNING)
        logging.getLogger('redis').setLevel(logging.WARNING)
    
    def _add_service_name_filter(self, root_logger: logging.Logger):
        """Add service name to log records"""
        class ServiceNameFilter(logging.Filter):
            def __init__(self, service_name: str):
                super().__init__()
                self.service_name = service_name
            
            def filter(self, record):
                record.service_name = self.service_name
                return True
        
        # Add service name filter to all handlers
        service_filter = ServiceNameFilter(self.service_name)
        for handler in root_logger.handlers:
            handler.addFilter(service_filter)


def setup_logging(service_name: str) -> None:
    """
    Setup logging configuration for a service
    
    Args:
        service_name: Name of the service (e.g., 'admin_service', 'api_service')
    """
    LoggingConfig(service_name)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the specified name
    
    Args:
        name: Logger name (usually __name__)
        
    Returns:
        logging.Logger: Logger instance
    """
    return logging.getLogger(name) 