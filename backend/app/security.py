"""
Security middleware for FastAPI.

Provides:
- Suspicious request detection and logging
- Bot protection basics
- Honeypot route detection
"""

import time
import re
from typing import Callable, Optional
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)


class SecurityMiddleware:
    """
    Middleware for detecting suspicious requests.

    Detects:
    - Missing User-Agent
    - Very high frequency from same IP
    - Rapid service page access
    - Invalid/malformed headers
    """

    def __init__(self):
        # Track request timestamps per IP for frequency detection
        self.ip_timestamps: dict = {}
        # Track suspicious IPs
        self.suspicious_ips: set = set()

    def get_client_ip(self, request: Request) -> str:
        """Extract client IP from request."""
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
        if request.client:
            return request.client.host
        return "unknown"

    def is_suspicious_request(self, request: Request) -> tuple[bool, Optional[str]]:
        """
        Check if request looks suspicious.

        Returns:
            (is_suspicious, reason)
        """
        ip = self.get_client_ip(request)

        # Already flagged as suspicious
        if ip in self.suspicious_ips:
            return True, "Previously flagged IP"

        # Check User-Agent
        user_agent = request.headers.get("user-agent", "")
        accept = request.headers.get("accept", "")

        # Missing User-Agent (common bot behavior)
        if not user_agent:
            return True, "Missing User-Agent header"

        # Very short User-Agent (possible bot)
        if len(user_agent) < 10:
            return True, "Suspiciously short User-Agent"

        # Missing Accept header (not a real browser)
        if not accept and request.method == "GET":
            return True, "Missing Accept header"

        # Check for suspicious paths (common scraper paths)
        path = request.url.path.lower()
        suspicious_paths = [
            "/wp-admin",
            "/wp-login",
            "/admin/config",
            "/.env",
            "/api/_internal",
            "/phpmyadmin",
            "/backup",
            "/.git/",
            "/config/",
        ]
        for sus_path in suspicious_paths:
            if path.startswith(sus_path):
                # Only log, don't block legitimate requests to valid paths
                logger.info(f"Suspicious path access: {path} from {ip}")

        # Frequency check - more than 30 requests in 10 seconds
        current_time = time.time()
        if ip in self.ip_timestamps:
            recent_requests = [
                ts for ts in self.ip_timestamps[ip]
                if current_time - ts < 10
            ]
            if len(recent_requests) > 30:
                self.suspicious_ips.add(ip)
                logger.warning(f"IP {ip} flagged as suspicious due to high frequency")
                return True, "High frequency requests"
            self.ip_timestamps[ip] = recent_requests + [current_time]
        else:
            self.ip_timestamps[ip] = [current_time]

        return False, None

    def log_request(self, request: Request, status_code: int = 200):
        """Log request details for security monitoring."""
        ip = self.get_client_ip(request)
        logger.info(
            f"Request: {request.method} {request.url.path} from {ip} "
            f"- Status: {status_code} - UA: {request.headers.get('user-agent', 'N/A')[:50]}"
        )


security_middleware = SecurityMiddleware()
