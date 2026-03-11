import json
import logging
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List, Tuple
from services.common.database import SessionLocal
from datetime import datetime
from services.admin_service.repositories.payment_channel_repository import PaymentChannelRepository
from services.common.models.payment_channel import PaymentChannel
from services.common.utils.secure_config import decrypt_config

logger = logging.getLogger(__name__)

class PaymentChannelService:
    def __init__(self, db: Session = SessionLocal()):
        self.db = db
        self.payment_channel_repository = PaymentChannelRepository(db)
    
    def list(self) -> Tuple[int, List[PaymentChannel]]:
        return self.payment_channel_repository.payment_channel_list()

    def available_list(self) -> List[PaymentChannel]:
        """Get list of available payment channels"""
        return self.payment_channel_repository.payment_channel_available_list()
    
    def get(self, id: str) -> Optional[PaymentChannel]:
        return self.payment_channel_repository.payment_channel_get(id)
    
    def update_status(self, id: str, status: int) -> Optional[PaymentChannel]:
        return self.payment_channel_repository.update_status(id, status)
    
    def update_config(self, id: str, config: str) -> Optional[PaymentChannel]:
        return self.payment_channel_repository.update_config(id, config)

    def get_config(self, id: str) -> Optional[dict]:
        """Get payment channel config by ID"""
        channel_config = self.payment_channel_repository.payment_channel_get(id)
        if channel_config is None:
            return None
        # Support encrypted-at-rest config
        config = {}
        if channel_config.config:
            cfg = decrypt_config(channel_config.config)
            if cfg is None:
                logger.error("Failed to decrypt or parse payment channel config")
                return None
            config = cfg
        config["enable"] = channel_config.status == 1
        config["id"] = channel_config.id
        return config

    
    def get_stripe_config(self) -> Optional[Dict[str, Any]]:
        """Get Stripe payment channel config"""
        try:
            stripe_channel = self.payment_channel_repository.payment_channel_get("stripe")
            
            if not stripe_channel:
                logger.warning("Stripe payment channel config does not exist")
                return None
                
            if stripe_channel.status != 1:
                logger.warning("Stripe payment channel is disabled")
                return None
                
            if not stripe_channel.config:
                logger.warning("Stripe payment channel config is empty")
                return None
                
            # Decrypt/parse config JSON
            config = decrypt_config(stripe_channel.config)
            if config is None:
                logger.error("Failed to decrypt Stripe config")
                return None
            # Validate required fields
            if not config.get("secret") or not config.get("webhook_secret"):
                logger.warning("Stripe config missing required fields: secret or webhook_secret")
                return None
            logger.info("Successfully retrieved Stripe config")
            return config
                
        except Exception as e:
            logger.error(f"Failed to get Stripe config: {str(e)}")
            return None