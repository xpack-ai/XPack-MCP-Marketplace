from services.common.models.user import User


class UserUtils:
    @staticmethod
    def get_request_user(request) -> User:
        """Get user object from request"""
        return request.scope.get("user")

    @staticmethod
    def get_request_user_token(request) -> str:
        """Get user token from request"""
        return request.scope.get("user_token", "")

    @staticmethod
    def get_request_user_id(request) -> str:
        """Get user ID from request"""
        user = UserUtils.get_request_user(request)
        if not user or not getattr(user, "id", None):
            raise ValueError("User not found in request or user_id missing")
        return user.id

    @staticmethod
    def is_admin(request) -> bool:
        """Check if current user is admin"""
        user = UserUtils.get_request_user(request)
        return user and user.role_id == 1 if user else False
    
    @staticmethod
    def is_normal_user(request) -> bool:
        """Check if current user is normal user"""
        user = UserUtils.get_request_user(request)
        return user and user.role_id == 2 if user else False
