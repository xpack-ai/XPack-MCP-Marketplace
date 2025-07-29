import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from services.admin_service.services.sys_config_service import SysConfigService
from services.admin_service.constants import sys_config_key
from services.common.config import Config


class EmailUtils:
    """
    """

    @staticmethod
    def get_email_config(db: Session) -> dict:
        """
        """
        sysconfig_service = SysConfigService(db)
        
        smtp_host = sysconfig_service.get_value_by_key(sys_config_key.KEY_EMAIL_SMTP_HOST)
        smtp_port = sysconfig_service.get_value_by_key(sys_config_key.KEY_EMAIL_SMTP_PORT)
        smtp_user = sysconfig_service.get_value_by_key(sys_config_key.KEY_EMAIL_SMTP_USER)
        smtp_password = sysconfig_service.get_value_by_key(sys_config_key.KEY_EMAIL_SMTP_PASSWORD)
        smtp_sender = sysconfig_service.get_value_by_key(sys_config_key.KEY_EMAIL_SMTP_SENDER)
        
        if smtp_host and smtp_port and smtp_user and smtp_password:
            return {
                'host': smtp_host,
                'port': int(smtp_port),
                'user': smtp_user,
                'password': smtp_password,
                'sender': smtp_sender or smtp_user,
            }
        
        logging.warning("Complete email config not found in system config, using environment variables")
        return {
            'host': Config.SMTP_HOST,
            'port': Config.SMTP_PORT,
            'user': Config.SMTP_USER,
            'password': Config.SMTP_PASSWORD,
            'sender': Config.SMTP_SENDER,
        }

    @staticmethod
    def send_email(
        db: Session,
        subject: str,
        body: str,
        to: str,
        is_html: bool = False,
    ) -> bool:
        """
        """
        try:
            email_config = EmailUtils.get_email_config(db)
            
            sender = email_config['sender']
            msg = MIMEMultipart()
            msg["From"] = sender
            msg["To"] = to
            msg["Subject"] = subject

            logging.info(f"Sending email with dynamic config SMTP host: {email_config['host']}")

            if is_html:
                msg.attach(MIMEText(body, "html", "utf-8"))
            else:
                msg.attach(MIMEText(body, "plain", "utf-8"))

            if email_config['port'] == 465:
                server = smtplib.SMTP_SSL(email_config['host'], email_config['port'])
            else:
                server = smtplib.SMTP(email_config['host'], email_config['port'])
                server.starttls()
            
            server.login(email_config['user'], email_config['password'])
            server.sendmail(sender, [to], msg.as_string())
            server.quit()
            
            logging.info(f"Email sent successfully to {to}")
            return True
            
        except Exception as e:
            logging.error(f"Failed to send email: {e}")
            return False

    @staticmethod
    def test_email_config(db: Session) -> Tuple[bool, str]:
        """
        """
        try:
            email_config = EmailUtils.get_email_config(db)
            
            if email_config['port'] == 465:
                server = smtplib.SMTP_SSL(email_config['host'], email_config['port'])
            else:
                server = smtplib.SMTP(email_config['host'], email_config['port'])
                server.starttls()
            
            server.login(email_config['user'], email_config['password'])
            server.quit()
            
            return True, "Email config test successful"
            
        except Exception as e:
            return False, f"Email config test failed: {str(e)}"

    @staticmethod
    def send_register_code_email(db: Session, email: str, confirm_code: str) -> bool:
        """
        
        Args:
            
        Returns:
        """
        try:
            from services.common.utils.email_template_utils import EmailTemplateUtils
            
            html_content = EmailTemplateUtils.render_register_code_email(db, confirm_code)
            if not html_content:
                logging.error("Failed to render email template")
                return False
            
            platform_config = EmailTemplateUtils.get_platform_config(db)
            subject = f"👋Your verification code for {platform_config['platform_name']}"
            
            return EmailUtils.send_email(db, subject, html_content, email, is_html=True)
            
        except Exception as e:
            logging.error(f"Failed to send registration captcha email: {str(e)}")
            return False
