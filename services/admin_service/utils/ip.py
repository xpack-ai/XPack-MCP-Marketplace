import socket
import json
import urllib.request
from typing import Optional
import logging

logger = logging.getLogger(__name__)

def get_public_ip(timeout: float = 2.0) -> Optional[str]:
    providers = [
        "https://api.ipify.org?format=json",
        "https://checkip.amazonaws.com",
        "https://ifconfig.me/ip",
    ]
    for url in providers:
        try:
            with urllib.request.urlopen(url, timeout=timeout) as resp:
                content = resp.read().decode("utf-8").strip()
                if content.startswith("{"):
                    try:
                        data = json.loads(content)
                        ip = data.get("ip")
                    except Exception:
                        ip = None
                else:
                    ip = content.split()[0] if content else None
                if ip:
                    return ip
        except Exception as e:
            logger.debug(f"Public IP provider failed {url}: {e}")
    return None

def get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception as e:
        logger.debug(f"Local IP detection via socket failed: {e}")
    try:
        return socket.gethostbyname(socket.gethostname())
    except Exception as e:
        logger.debug(f"Local IP detection via hostname failed: {e}")
    return "127.0.0.1"