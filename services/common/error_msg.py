# Common error messages for global use
# All error messages use English for consistency and internationalization

# 4xx Client Errors
INVALID_REQUEST = {"code": 400, "message": "Invalid request parameters"}
MISSING_PARAMETER = {"code": 400, "message": "Required parameter is missing"}
INVALID_URL = {"code": 400, "message": "Invalid URL provided"}
INVALID_FORMAT = {"code": 400, "message": "Invalid data format"}

UNAUTHORIZED = {"code": 401, "message": "Authentication required"}
INVALID_TOKEN = {"code": 401, "message": "Invalid or expired token"}
NO_PERMISSION = {"code": 403, "message": "Access denied, insufficient permissions"}
MISSING_URL_OR_FILE = {"code": 422, "message": "Either URL or file must be provided for OpenAPI parsing"}

FORBIDDEN = {"code": 403, "message": "Access forbidden"}
INSUFFICIENT_PERMISSION = {"code": 403, "message": "Insufficient permission"}

NOT_FOUND = {"code": 404, "message": "Resource not found"}
ENDPOINT_NOT_FOUND = {"code": 404, "message": "Endpoint not found"}

CONFLICT = {"code": 409, "message": "Resource conflict"}
DUPLICATE_RESOURCE = {"code": 409, "message": "Resource already exists"}

VALIDATION_FAILED = {"code": 422, "message": "Validation failed"}
BUSINESS_ERROR = {"code": 422, "message": "Business logic error"}

# 5xx Server Errors  
INTERNAL_ERROR = {"code": 500, "message": "Internal server error"}
DATABASE_ERROR = {"code": 500, "message": "Database operation failed"}
EXTERNAL_SERVICE_ERROR = {"code": 500, "message": "External service error"}

SERVICE_UNAVAILABLE = {"code": 503, "message": "Service temporarily unavailable"}
TIMEOUT_ERROR = {"code": 504, "message": "Request timeout"}
