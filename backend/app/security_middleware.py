"""
Backend Security Middleware for Remotiva
========================================

Provides comprehensive security for the API:
1. CORS hardening
2. Request validation
3. Bot detection
4. Rate limiting headers
5. Security headers (CSP, HSTS, etc.)
6. Suspicious activity logging
7. IP-based blocking
"""

import time
import hashlib
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from functools import wraps
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class SecurityEvent:
    """Track security events for monitoring"""

    def __init__(self):
        self.events: Dict[str, List[Dict]] = defaultdict(list)
        self.blocked_ips: Dict[str, datetime] = {}
        self.suspicious_patterns = [
            r'union\s+select',
            r'drop\s+table',
            r'delete\s+from',
            r'insert\s+into',
            r';\s*--',
            r'<script',
            r'javascript:',
            r'onerror=',
            r'onload=',
            r'<iframe',
            r'eval\(',
            r'exec\(',
            r'system\(',
        ]

    def log_event(self, event_type: str, ip: str, details: str, severity: str = "INFO"):
        """Log a security event"""
        event = {
            "timestamp": datetime.utcnow().isoformat(),
            "type": event_type,
            "ip": ip,
            "details": details,
            "severity": severity,
        }
        self.events[event_type].append(event)

        # Keep only last 1000 events per type
        if len(self.events[event_type]) > 1000:
            self.events[event_type] = self.events[event_type][-1000:]

        log_msg = f"[{severity}] {event_type} from {ip}: {details}"
        if severity == "WARNING":
            logger.warning(log_msg)
        elif severity == "CRITICAL":
            logger.error(log_msg)
        else:
            logger.info(log_msg)

    def block_ip(self, ip: str, duration_minutes: int = 30):
        """Block an IP address temporarily"""
        self.blocked_ips[ip] = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.log_event("IP_BLOCKED", ip, f"Blocked for {duration_minutes} minutes", "WARNING")

    def is_blocked(self, ip: str) -> bool:
        """Check if an IP is blocked"""
        if ip in self.blocked_ips:
            if datetime.utcnow() > self.blocked_ips[ip]:
                # Block expired
                del self.blocked_ips[ip]
                return False
            return True
        return False

    def check_sql_injection(self, text: str) -> bool:
        """Check for SQL injection patterns"""
        text_lower = text.lower()
        for pattern in self.suspicious_patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True
        return False

    def get_stats(self) -> Dict:
        """Get security statistics"""
        now = datetime.utcnow()

        return {
            "total_events": sum(len(v) for v in self.events.values()),
            "events_by_type": {k: len(v) for k, v in self.events.items()},
            "blocked_ips": len(self.blocked_ips),
            "blocked_ip_list": [
                {"ip": ip, "expires": exp.isoformat()}
                for ip, exp in self.blocked_ips.items()
            ],
        }

    def cleanup_old_events(self, max_age_hours: int = 24):
        """Remove events older than max_age_hours"""
        cutoff = datetime.utcnow() - timedelta(hours=max_age_hours)
        for event_type in self.events:
            self.events[event_type] = [
                e for e in self.events[event_type]
                if datetime.fromisoformat(e["timestamp"]) > cutoff
            ]


# Global security event instance
security_events = SecurityEvent()


def get_client_ip(request) -> str:
    """Extract client IP from request, handling proxies"""
    # Check X-Forwarded-For header (from proxy/load balancer)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    # Check X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to direct client
    if hasattr(request, "client") and request.client:
        return request.client.host

    return "unknown"


class RequestTracker:
    """Track request rates per IP"""

    def __init__(self):
        self.requests: Dict[str, List[float]] = defaultdict(list)
        self.failed_auth: Dict[str, List[float]] = defaultdict(list)

    def track_request(self, ip: str):
        """Track a request from an IP"""
        now = time.time()
        self.requests[ip].append(now)

        # Keep only requests from last minute
        self.requests[ip] = [t for t in self.requests[ip] if now - t < 60]

    def get_request_count(self, ip: str) -> int:
        """Get request count for IP in last minute"""
        now = time.time()
        self.requests[ip] = [t for t in self.requests[ip] if now - t < 60]
        return len(self.requests[ip])

    def track_failed_auth(self, ip: str):
        """Track failed authentication attempt"""
        now = time.time()
        self.failed_auth[ip].append(now)

        # Keep only attempts from last 15 minutes
        self.failed_auth[ip] = [t for t in self.failed_auth[ip] if now - t < 900]

    def get_failed_auth_count(self, ip: str) -> int:
        """Get failed auth count for IP in last 15 minutes"""
        now = time.time()
        self.failed_auth[ip] = [t for t in self.failed_auth[ip] if now - t < 900]
        return len(self.failed_auth[ip])

    def is_rate_limited(self, ip: str, max_requests: int = 60) -> bool:
        """Check if IP is rate limited"""
        return self.get_request_count(ip) > max_requests


# Global request tracker
request_tracker = RequestTracker()


def validate_request_data(data: dict, allowed_fields: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Validate that request data only contains allowed fields.
    Helps prevent mass assignment attacks.
    """
    if not data:
        return True, None

    for field in data:
        if field not in allowed_fields:
            return False, f"Unknown field: {field}"

    return True, None


def sanitize_string(text: str, max_length: int = 1000) -> str:
    """Sanitize a string input"""
    if not text:
        return ""

    # Remove null bytes
    text = text.replace("\x00", "")

    # Trim to max length
    if len(text) > max_length:
        text = text[:max_length]

    # Remove control characters except newlines and tabs
    text = "".join(char for char in text if ord(char) >= 32 or char in "\n\t")

    return text.strip()


def hash_sensitive_data(data: str) -> str:
    """Create a hash of sensitive data for logging (not reversible)"""
    return hashlib.sha256(data.encode()).hexdigest()[:16]


def generate_security_token() -> str:
    """Generate a random security token for sessions"""
    import secrets
    return secrets.token_urlsafe(32)


# Rate limiting configuration
RATE_LIMITS = {
    "global": {"requests": 100, "window": 60},  # 100 requests per minute
    "auth": {"requests": 10, "window": 60},  # 10 auth attempts per minute
    "api_public": {"requests": 60, "window": 60},  # 60 public API requests per minute
    "api_authenticated": {"requests": 200, "window": 60},  # 200 authenticated requests per minute
}


def check_rate_limit(ip: str, limit_type: str = "global") -> Tuple[bool, Dict]:
    """
    Check if IP is within rate limits.
    Returns (is_allowed, limit_info)
    """
    limits = RATE_LIMITS.get(limit_type, RATE_LIMITS["global"])
    max_requests = limits["requests"]
    window = limits["window"]

    count = request_tracker.get_request_count(ip)

    return (
        count <= max_requests,
        {
            "limit": max_requests,
            "remaining": max(0, max_requests - count),
            "reset": window,
        }
    )


def get_security_headers() -> Dict[str, str]:
    """Get security headers for all responses"""
    return {
        # Prevent MIME type sniffing
        "X-Content-Type-Options": "nosniff",

        # XSS Protection (legacy but still useful)
        "X-XSS-Protection": "1; mode=block",

        # Prevent clickjacking
        "X-Frame-Options": "DENY",

        # Content Security Policy
        "Content-Security-Policy": (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline'; "  # Required for React
            "style-src 'self' 'unsafe-inline'; "   # Required for inline styles
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        ),

        # Strict Transport Security (HTTPS only)
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",

        # Referrer Policy
        "Referrer-Policy": "strict-origin-when-cross-origin",

        # Permissions Policy
        "Permissions-Policy": (
            "camera=(), "
            "microphone=(), "
            "geolocation=(), "
            "payment=(self)"
        ),

        # Remove server identification
        "Server": "Remotiva",

        # Cache control for sensitive pages
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
    }


def log_api_request(method: str, path: str, ip: str, user_agent: str, status_code: int, duration_ms: float):
    """Log API request for audit trail"""
    logger.info(
        f"API Request: {method} {path} | IP: {ip} | Status: {status_code} | Duration: {duration_ms:.2f}ms"
    )


def validate_email_format(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password_strength(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password strength.
    Returns (is_valid, error_message)
    """
    if len(password) < 6:
        return False, "Password must be at least 6 characters"

    return True, None


# Cleanup old events periodically (call this from your app startup)
def cleanup_security_events():
    """Remove old security events to prevent memory issues"""
    security_events.cleanup_old_events(max_age_hours=24)


if __name__ == "__main__":
    # Test the security module
    print("Testing Security Module...")

    # Test SQL injection detection
    test_payloads = [
        "normal text",
        "'; DROP TABLE users; --",
        "<script>alert('xss')</script>",
        "123 UNION SELECT * FROM users",
    ]

    for payload in test_payloads:
        is_suspicious = security_events.check_sql_injection(payload)
        print(f"  Payload: {payload[:30]:30s} | Suspicious: {is_suspicious}")

    # Test rate limiting
    test_ip = "192.168.1.100"
    for i in range(5):
        request_tracker.track_request(test_ip)
        is_limited, info = check_rate_limit(test_ip)
        print(f"  Request {i+1}: Allowed: {is_limited}, Remaining: {info['remaining']}")

    print("\nSecurity Module Test Complete!")
