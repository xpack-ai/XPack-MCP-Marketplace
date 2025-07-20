from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from services.common.database import get_db
from services.common.utils.response_utils import ResponseUtils
from services.common.utils.email_utils import EmailUtils
import logging

router = APIRouter()


@router.post("/send_template_email")
def send_template_email(
    body: dict = Body(...),
    db: Session = Depends(get_db),
):
    """Send test template email with verification code."""
    try:
        email = body.get("email")
        code = body.get("code", "123456")  # Default verification code
        
        if not email:
            return ResponseUtils.error("Please provide an email address")
        
        # Send template email
        success = EmailUtils.send_register_code_email(db, email, code)
        
        if success:
            return ResponseUtils.success(data={"message": "Template email sent successfully, please check your inbox"})
        else:
            return ResponseUtils.error("Failed to send template email")
            
    except Exception as e:
        logging.error(f"Failed to send template email: {str(e)}")
        return ResponseUtils.error(f"Failed to send template email: {str(e)}")
