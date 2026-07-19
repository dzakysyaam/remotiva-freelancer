"""
Simple in-memory rate limiter middleware for FastAPI.

This is a basic implementation suitable for demo/local development.
For production, consider using Redis-based rate limiting with slowapi or custom solution.
"""

import time
import os
from collections import defaultdict
from typing import Callable, Dict, List, Tuple
from fastapi import Request, Response
from fastapi.responses import JSONResponse
import logging

logger = logging.getLogger(__name__)

# Disable rate limiter for testing
DISABLE_RATE_LIMIT = os.environ.get("DISABLE_RATE_LIMIT", "false").lower() in ("true", "1", "yes")


class RateLimiter:
    """
    Simple sliding window rate limiter.

    Tracks requests per IP address and blocks when limit exceeded.
    """

    def __init__(self):
        # Track requests: { ip: [(timestamp, path), ...] }
        self.requests: Dict[str, List[Tuple[float, str]]] = defaultdict(list)
        # Window size in seconds
        self.window = 60
        # Cleanup old entries periodically
        self.last_cleanup = time.time()

    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP from request, handling proxies."""
        # Check X-Forwarded-For header (for deployments behind proxy/load balancer)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            # Take the first IP in the chain
            return forwarded.split(",")[0].strip()

        # Check X-Real-IP header
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()

        # Fall back to direct client IP
        if request.client:
            return request.client.host

        return "unknown"

    def _cleanup_old_entries(self):
        """Remove entries older than the window."""
        current_time = time.time()
        # Cleanup every 5 minutes
        if current_time - self.last_cleanup > 300:
            cutoff = current_time - self.window
            for ip in list(self.requests.keys()):
                self.requests[ip] = [
                    (ts, path) for ts, path in self.requests[ip] if ts > cutoff
                ]
                if not self.requests[ip]:
                    del self.requests[ip]
            self.last_cleanup = current_time

    def is_allowed(self, request: Request, limit: int, path_prefix: str = None) -> Tuple[bool, Response]:
        """
        Check if request is allowed under rate limit.

        Args:
            request: FastAPI request object
            limit: Maximum requests per window
            path_prefix: Optional path prefix to track separately

        Returns:
            Tuple of (is_allowed, response_if_not_allowed)
        """
        # Skip rate limiting for testing
        if DISABLE_RATE_LIMIT:
            return True, None

        self._cleanup_old_entries()

        ip = self._get_client_ip(request)
        current_time = time.time()
        cutoff = current_time - self.window

        # Clean old entries for this IP
        self.requests[ip] = [
            (ts, path) for ts, path in self.requests[ip] if ts > cutoff
        ]

        # Count requests in window
        request_count = len(self.requests[ip])

        # If path_prefix specified, count only matching paths
        if path_prefix:
            request_count = len([
                (ts, path) for ts, path in self.requests[ip]
                if path.startswith(path_prefix)
            ])

        if request_count >= limit:
            logger.warning(
                f"Rate limit exceeded for IP {ip} on path {request.url.path} "
                f"({request_count}/{limit} requests in {self.window}s window)"
            )
            return False, JSONResponse(
                status_code=429,
                content={
                    "detail": "Terlalu banyak permintaan. Silakan coba lagi nanti."
                },
                headers={
                    "Retry-After": str(self.window),
                    "X-RateLimit-Limit": str(limit),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(int(current_time + self.window)),
                }
            )

        # Record this request
        self.requests[ip].append((current_time, request.url.path))

        return True, None


# Global rate limiter instance
rate_limiter = RateLimiter()


def get_rate_limit_headers(limit: int, ip: str) -> Dict[str, str]:
    """Generate rate limit headers for response."""
    current_time = time.time()
    cutoff = current_time - 60

    # Count remaining requests
    remaining = limit - len([
        ts for ts, _ in rate_limiter.requests.get(ip, [])
        if ts > cutoff
    ])

    return {
        "X-RateLimit-Limit": str(limit),
        "X-RateLimit-Remaining": str(max(0, remaining)),
        "X-RateLimit-Reset": str(int(current_time + 60)),
    }
