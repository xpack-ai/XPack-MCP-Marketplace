from sqlalchemy.orm import Session
from typing import Optional, List
from services.common.database import SessionLocal
from datetime import datetime, timedelta

from services.common.models.user import User

from services.admin_service.repositories.user_repository import UserRepository
from services.admin_service.repositories.user_wallet_history_repository import UserWalletHistoryRepository
from services.admin_service.repositories.stats_mcp_service_date_repository import StatsMcpServiceDateRepository
from services.admin_service.repositories.mcp_service_repository import McpServiceRepository

class StatsService:
    def __init__(self, db: Session = SessionLocal()):
        self.user_repository = UserRepository(db)
        self.user_wallet_repository = UserWalletHistoryRepository(db)
        self.stats_mcp_service_date_repository = StatsMcpServiceDateRepository(db)
        self.mcp_service_repository = McpServiceRepository(db)
    
    def get_registered_user_stats(self) -> dict:
        """
        Get registered stats

        Returns:
            dict: Registered stats
        """
        now = datetime.now()
        pass30 = now - timedelta(days=30)
        
        return {
            "total": self.user_repository.get_registered_user_count(),
            "today": self.user_repository.get_registered_user_count(now),
            "days": self.user_repository.get_registered_user_trend(pass30, now)
        }
    def get_deposit_stats(self) -> dict:
        """
        Get deposit stats

        Returns:
            dict: Deposit stats
        """
        now = datetime.now()
        pass30 = now - timedelta(days=30)
        
        return {
            "total": self.user_wallet_repository.stats_deposit_amount(),
            "today": self.user_wallet_repository.stats_deposit_amount(now),
            "days": self.user_wallet_repository.stats_deposit_amount_trend(pass30, now)
        }
    def get_call_stats(self) -> dict:
        """
        Get call stats

        Returns:
            dict: Call stats
        """
        now = datetime.now()
        pass30 = now - timedelta(days=30)
        
        return {
            "total": self.stats_mcp_service_date_repository.stats_call_count(),
            "today": self.stats_mcp_service_date_repository.stats_call_count(now),
            "days": self.stats_mcp_service_date_repository.stats_call_count_trend(pass30, now)
        }
        
    def get_call_stats_group_by_service(self) -> list:
        """
        Get call stats group by service

        Returns:
            dict: Call stats group by service
        """
        now = datetime.now()
        pass30 = now - timedelta(days=30)
        # 获取统计数据（仅包含有调用的服务）
        stats = self.stats_mcp_service_date_repository.stats_call_count_group_by_service(pass30, now)
        stats_map = {item["service_id"]: int(item.get("count", 0)) for item in stats}

        # 遍历所有服务，填充缺失调用数为 0，并按调用数降序
        services = self.mcp_service_repository.get_all()
        result = [
            {
                "id": service.id,
                "name": service.name,
                "short_description": service.short_description,
                "call_count": stats_map.get(service.id, 0),
            }
            for service in services
        ]
        # 先按调用数降序，再按名称升序
        result.sort(key=lambda x: (-x["call_count"], x["name"]))
        return result