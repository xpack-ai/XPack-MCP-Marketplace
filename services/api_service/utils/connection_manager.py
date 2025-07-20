"""
Connection management utility - Help MCP clients manage connection state and reconnection
"""
import time
from typing import Dict, Optional
from dataclasses import dataclass
from services.common.logging_config import get_logger

logger = get_logger(__name__)


@dataclass
class ConnectionInfo:
    """Connection information"""
    service_id: str
    user_id: str
    client_ip: str
    connected_at: float
    last_activity: float
    connection_count: int = 1


class ConnectionManager:
    """
    MCP connection manager
    
    Track active connections, help diagnose connection issues and support reconnection logic
    """
    
    def __init__(self):
        self.connections: Dict[str, ConnectionInfo] = {}
        
    def register_connection(self, service_id: str, user_id: str, client_ip: str) -> str:
        """
        Register new connection
        
        Args:
            service_id: Service ID
            user_id: User ID  
            client_ip: Client IP
            
        Returns:
            str: Connection identifier
        """
        connection_key = f"{service_id}:{user_id}:{client_ip}"
        current_time = time.time()
        
        if connection_key in self.connections:
            # Update existing connection
            conn_info = self.connections[connection_key]
            conn_info.connected_at = current_time
            conn_info.last_activity = current_time
            conn_info.connection_count += 1
            logger.info(f"Updated connection record - {connection_key}, connection count: {conn_info.connection_count}")
        else:
            # Create new connection record
            self.connections[connection_key] = ConnectionInfo(
                service_id=service_id,
                user_id=user_id,
                client_ip=client_ip,
                connected_at=current_time,
                last_activity=current_time
            )
            logger.info(f"Registered new connection - {connection_key}")
            
        return connection_key
        
    def update_activity(self, connection_key: str) -> None:
        """
        Update connection activity time
        
        Args:
            connection_key: Connection identifier
        """
        if connection_key in self.connections:
            self.connections[connection_key].last_activity = time.time()
            
    def unregister_connection(self, connection_key: str) -> None:
        """
        Unregister connection
        
        Args:
            connection_key: Connection identifier
        """
        if connection_key in self.connections:
            conn_info = self.connections.pop(connection_key)
            duration = time.time() - conn_info.connected_at
            logger.info(f"Unregistered connection - {connection_key}, duration: {duration:.2f}s")
            
    def get_connection_info(self, connection_key: str) -> Optional[ConnectionInfo]:
        """
        Get connection information
        
        Args:
            connection_key: Connection identifier
            
        Returns:
            Optional[ConnectionInfo]: Connection information
        """
        return self.connections.get(connection_key)
        
    def get_service_connections(self, service_id: str) -> Dict[str, ConnectionInfo]:
        """
        Get all connections for specified service
        
        Args:
            service_id: Service ID
            
        Returns:
            Dict[str, ConnectionInfo]: Connection information dictionary
        """
        return {
            key: info for key, info in self.connections.items() 
            if info.service_id == service_id
        }
        
    def cleanup_stale_connections(self, timeout_seconds: int = 300) -> None:
        """
        Cleanup stale connection records
        
        Args:
            timeout_seconds: Timeout in seconds
        """
        current_time = time.time()
        stale_keys = [
            key for key, info in self.connections.items()
            if current_time - info.last_activity > timeout_seconds
        ]
        
        for key in stale_keys:
            logger.info(f"Cleanup stale connection - {key}")
            self.connections.pop(key, None)
            
    def get_stats(self) -> Dict:
        """
        Get connection statistics
        
        Returns:
            Dict: Statistics information
        """
        total_connections = len(self.connections)
        services = set(info.service_id for info in self.connections.values())
        users = set(info.user_id for info in self.connections.values())
        
        return {
            "total_connections": total_connections,
            "unique_services": len(services),
            "unique_users": len(users),
            "services": list(services),
            "connection_details": [
                {
                    "key": key,
                    "service_id": info.service_id,
                    "user_id": info.user_id,
                    "client_ip": info.client_ip,
                    "connected_at": info.connected_at,
                    "last_activity": info.last_activity,
                    "duration": time.time() - info.connected_at,
                    "connection_count": info.connection_count
                }
                for key, info in self.connections.items()
            ]
        }


# Global connection manager instance
connection_manager = ConnectionManager()
