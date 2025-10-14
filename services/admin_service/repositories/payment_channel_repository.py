from datetime import datetime, timezone
from sqlalchemy.orm import Session
from services.common.models.payment_channel import PaymentChannel
from typing import Optional, Tuple, List

class PaymentChannelRepository:
    def __init__(self, db: Session):
        self.db = db

    def payment_channel_list(self) -> Tuple[int, List[PaymentChannel]]:
        return self.db.query(PaymentChannel).count(),self.db.query(PaymentChannel).all()

    def payment_channel_get(self, id: str) -> Optional[PaymentChannel]:
        return self.db.query(PaymentChannel).filter(PaymentChannel.id == id).first()

    def payment_channel_available_list(self) -> List[PaymentChannel]:
        return self.db.query(PaymentChannel).filter(PaymentChannel.status == 1).all()

    def update_status(self, id: str, status: int) -> Optional[PaymentChannel]:
        payment_channel = self.payment_channel_get(id)
        if payment_channel:
            payment_channel.status = status
            payment_channel.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            return payment_channel
        return None

    def update_config(self, id: str, config: str) -> Optional[PaymentChannel]:
        payment_channel = self.payment_channel_get(id)
        if payment_channel:
            payment_channel.config = config
            payment_channel.updated_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(payment_channel)
            return payment_channel
        return None