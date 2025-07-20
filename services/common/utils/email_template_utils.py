import os
import logging
from typing import Dict, Optional
from sqlalchemy.orm import Session
from services.admin_service.services.sys_config_service import SysConfigService
from services.admin_service.constants import sys_config_key


class EmailTemplateUtils:
    """
    """

    @staticmethod
    def load_template(template_name: str) -> Optional[str]:
        """
        
        Args:
            
        Returns:
        """
        template_path = None
        try:
            current_dir = os.path.dirname(os.path.abspath(__file__))
            template_path = os.path.join(
                current_dir, 
                "..", 
                "..",
                "common",
                "templates", 
                "email", 
                f"{template_name}.html"
            )
            
            with open(template_path, 'r', encoding='utf-8') as file:
                return file.read()
                
        except FileNotFoundError:
            logging.error(f"Email template file not found: {template_path}")
            return None
        except Exception as e:
            logging.error(f"Failed to read email template: {str(e)}")
            return None

    @staticmethod
    def get_platform_config(db: Session) -> Dict[str, str]:
        """
        
        Args:
            
        Returns:
        """
        try:
            sysconfig_service = SysConfigService(db)
            
            platform_name = sysconfig_service.get_value_by_key(sys_config_key.KEY_PLATFORM_NAME)
            platform_logo = sysconfig_service.get_value_by_key(sys_config_key.KEY_PLATFORM_LOGO)
            platform_url = sysconfig_service.get_value_by_key(sys_config_key.KEY_PLATFORM_URL)
            
            return {
                'platform_name': platform_name or 'XPack',
                'platform_logo_url': platform_logo or 'https://via.placeholder.com/100x20?text=XPack',
                'platform_url': platform_url or '#'
            }
            
        except Exception as e:
            logging.error(f"Failed to get platform config: {str(e)}")
            return {
                'platform_name': 'XPack',
                'platform_logo_url': 'https://via.placeholder.com/100x20?text=XPack',
                'platform_url': '#'
            }

    @staticmethod
    def render_template(template_content: str, variables: Dict[str, str]) -> str:
        """
        
        Args:
            
        Returns:
        """
        try:
            rendered_content = template_content
            
            for key, value in variables.items():
                placeholder = f"{{{{{key}}}}}"
                rendered_content = rendered_content.replace(placeholder, str(value))
                
            return rendered_content
            
        except Exception as e:
            logging.error(f"Failed to render email template: {str(e)}")
            return template_content

    @staticmethod
    def render_register_code_email(db: Session, confirm_code: str) -> Optional[str]:
        """
        
        Args:
            
        Returns:
        """
        try:
            template_content = EmailTemplateUtils.load_template('email_register_code')
            if not template_content:
                return None
            
            platform_config = EmailTemplateUtils.get_platform_config(db)
            
            variables = {
                'platform_name': platform_config['platform_name'],
                'platform_logo_url': platform_config['platform_logo_url'],
                'confirm_code': confirm_code
            }
            
            return EmailTemplateUtils.render_template(template_content, variables)
            
        except Exception as e:
            logging.error(f"Failed to render registration captcha email template: {str(e)}")
            return None
