"""
Request utility functions
"""
import os
from fastapi import Request
from services.common.config import Config


class RequestUtils:
    """Request utility class"""
    
    @staticmethod
    def get_real_base_url(request: Request) -> str:
        """
        Get real base URL, handling reverse proxy cases
        
        In reverse proxy environments, URLs directly obtained from request 
        may not be the real external access address.
        This function checks various sources by priority to get the real base URL:
        
        1. X-Forwarded-Proto + X-Forwarded-Host headers
        2. X-Forwarded-Proto + Host header  
        3. Standard Forwarded header (RFC 7239)
        4. BASE_URL from config file
        5. Direct from request (fallback)
        """
        # 1. Check reverse proxy headers first
        forwarded_proto = request.headers.get("X-Forwarded-Proto") or request.headers.get("X-Forwarded-Protocol")
        forwarded_host = request.headers.get("X-Forwarded-Host") or request.headers.get("X-Forwarded-Server")
        
        if forwarded_proto and forwarded_host:
            return f"{forwarded_proto}://{forwarded_host}"
        
        # 2. Check other common proxy headers
        if forwarded_proto and request.headers.get("Host"):
            return f"{forwarded_proto}://{request.headers.get('Host')}"
        
        # 3. Check standard Forwarded header (RFC 7239)
        forwarded = request.headers.get("Forwarded")
        if forwarded:
            parts = {}
            for part in forwarded.split(';'):
                if '=' in part:
                    key, value = part.strip().split('=', 1)
                    parts[key] = value.strip('"')
            
            if 'proto' in parts and 'host' in parts:
                return f"{parts['proto']}://{parts['host']}"
        
        # 4. Get from config (if configured)
        if Config.BASE_URL:
            return Config.BASE_URL.rstrip('/')
        
        # 5. Final fallback to direct request
        return f"{request.url.scheme}://{request.url.netloc}"
    
    @staticmethod 
    def get_client_ip(request: Request) -> str:
        """Get client real IP address, handling reverse proxy cases"""
        # Check common proxy headers
        for header in ["X-Forwarded-For", "X-Real-IP", "X-Client-IP"]:
            ip = request.headers.get(header)
            if ip:
                # X-Forwarded-For may contain multiple IPs, take the first one
                return ip.split(',')[0].strip()
        
        # Check standard Forwarded header
        forwarded = request.headers.get("Forwarded")
        if forwarded:
            for part in forwarded.split(';'):
                if part.strip().startswith('for='):
                    ip = part.strip().split('=', 1)[1].strip('"')
                    # Remove port number
                    if ':' in ip and not ip.startswith('['):
                        ip = ip.split(':')[0]
                    elif ip.startswith('[') and ']:' in ip:
                        ip = ip.split(']:')[0] + ']'
                    return ip
        
        # Fallback to direct access
        return request.client.host if request.client else "unknown"
