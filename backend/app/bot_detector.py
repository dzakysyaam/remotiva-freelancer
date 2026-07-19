"""
Bot Detection and Suspicious Request Logging Middleware

This middleware:
1. Logs requests with suspicious patterns
2. Tracks high-frequency requests
3. Provides basic honeypot route detection

IMPORTANT: This is NOT a replacement for proper WAF/bot protection.
It provides basic logging and detection for manual review.
"""

import time
from collections import defaultdict
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Track suspicious activity
suspicious_ips = defaultdict(list)  # IP -> list of (timestamp, reason)
honeypot_hits = defaultdict(int)  # IP -> hit count

# Honeypot routes that normal UI should never call
HONEYPOT_ROUTES = [
    "/api/_internal/scrape-check",
    "/api/admin/dump",
    "/api/database/config",
    "/api/.env",
    "/api/internal/health",
]


class BotDetector:
    """
    Simple bot detection middleware.

    Tracks:
    - Missing User-Agent
    - High request frequency
    - Honeypot route access
    - Rapid service page crawling
    """

    def __init__(self):
        self.request_log = defaultdict(list)  # IP -> list of (timestamp, path)
        self.window = 60  # 1 minute window

    def _get_client_ip(self, request: Request) -> str:
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

    def _cleanup_old_entries(self, ip: str):
        """Remove entries older than window."""
        current_time = time.time()
        cutoff = current_time - self.window
        self.request_log[ip] = [
            (ts, path) for ts, path in self.request_log[ip] if ts > cutoff
        ]

    def check_request(self, request: Request) -> tuple[bool, str]:
        """
        Check if request appears suspicious.

        Returns:
            (is_suspicious, reason)
        """
        ip = self._get_client_ip(request)
        path = request.url.path
        current_time = time.time()

        # Check honeypot routes
        if path.lower() in HONEYPOT_ROUTES:
            honeypot_hits[ip] += 1
            logger.warning(
                f"HONEYPOT HIT: IP={ip} path={path} count={honeypot_hits[ip]}"
            )
            return True, f"honeypot_access:{path}"

        # Check missing User-Agent
        user_agent = request.headers.get("user-agent", "")
        if not user_agent:
            suspicious_ips[ip].append((current_time, "missing_user_agent"))
            logger.warning(f"SUSPICIOUS: IP={ip} path={path} reason=missing_user_agent")

        # Check for very rapid requests (100+ in a minute)
        self._cleanup_old_entries(ip)
        request_count = len(self.request_log[ip])

        # Log high frequency
        if request_count > 100:
            suspicious_ips[ip].append((current_time, "high_frequency"))
            logger.warning(
                f"HIGH FREQUENCY: IP={ip} path={path} count={request_count}/min"
            )

        # Check for rapid service page crawling
        if path.startswith("/api/services/") and path != "/api/services":
            recent_services = [
                ts for ts, p in self.request_log[ip]
                if p.startswith("/api/services/") and ts > current_time - 10
            ]
            if len(recent_services) > 30:
                suspicious_ips[ip].append((current_time, "service_crawl"))
                logger.warning(
                    f"SERVICE CRAWL: IP={ip} rapid service requests"
                )

        # Record this request
        self.request_log[ip].append((current_time, path))

        return False, ""

    def get_suspicious_ips(self, lookback_seconds: int = 3600) -> dict:
        """Get list of suspicious IPs for review."""
        current_time = time.time()
        cutoff = current_time - lookback_seconds
        result = {}

        for ip, entries in suspicious_ips.items():
            recent = [(ts, reason) for ts, reason in entries if ts > cutoff]
            if recent:
                result[ip] = {
                    "count": len(recent),
                    "reasons": list(set(reason for _, reason in recent)),
                    "first_seen": min(ts for ts, _ in recent),
                    "last_seen": max(ts for ts, _ in recent),
                }

        return result

    def get_honeypot_stats(self) -> dict:
        """Get honeypot hit statistics."""
        return dict(honeypot_hits)


# Global bot detector instance
bot_detector = BotDetector()


async def bot_detection_middleware(request: Request, call_next: Callable) -> Response:
    """
    Middleware that checks for suspicious requests and logs them.
    Does NOT block requests (for now) - just logs for review.
    """
    # Check for suspicious patterns
    is_suspicious, reason = bot_detector.check_request(request)

    # Log all requests for debugging (can be disabled in production)
    # Note: In high-traffic production, you might want to sample logs instead
    ip = bot_detector._get_client_ip(request)

    # Continue with the request regardless
    response = await call_next(request)

    # Log response for analysis
    if is_suspicious:
        logger.info(
            f"Request completed: IP={ip} path={request.url.path} "
            f"status={response.status_code} suspicious_reason={reason}"
        )

    return response
