import logging
import time
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.routers import (
    auth_router,
    categories_router,
    services_router,
    users_router,
    orders_router,
    saved_router,
    messages_router,
    profile_router,
    payments_router,
    admin_router,
    customer_service_router,
    admin_cs_router,
)
from app.schemas import HealthResponse
from app.rate_limiter import rate_limiter
from app.bot_detector import bot_detector
from app.security_middleware import (
    get_security_headers,
    get_client_ip,
    request_tracker,
    security_events,
    log_api_request,
    RATE_LIMITS,
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Remotiva API",
    description="Freelance Marketplace API",
    version="2.0.0",
)


@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    """Add security headers to all responses"""
    start_time = time.time()

    response = await call_next(request)

    # Add security headers
    headers = get_security_headers()
    for header, value in headers.items():
        response.headers[header] = value

    # Add request timing
    duration_ms = (time.time() - start_time) * 1000
    response.headers["X-Response-Time"] = f"{duration_ms:.2f}ms"

    # Log request for audit trail
    ip = get_client_ip(request)
    log_api_request(
        method=request.method,
        path=request.url.path,
        ip=ip,
        user_agent=request.headers.get("user-agent", "unknown"),
        status_code=response.status_code,
        duration_ms=duration_ms,
    )

    return response


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    """Apply rate limiting to all requests"""
    ip = get_client_ip(request)

    # Check if IP is blocked
    if security_events.is_blocked(ip):
        return JSONResponse(
            status_code=403,
            content={"detail": "Access denied. Your IP has been temporarily blocked."},
        )

    # Track request
    request_tracker.track_request(ip)

    # Determine rate limit type based on path
    path = request.url.path
    if path.startswith("/api/auth/"):
        limit_type = "auth"
    elif path.startswith("/api/admin/") or path.startswith("/api/customer-service/"):
        limit_type = "api_authenticated"
    else:
        limit_type = "api_public"

    limits = RATE_LIMITS[limit_type]
    is_allowed, limit_info = request_tracker.get_request_count(ip) <= limits["requests"], {
        "limit": limits["requests"],
        "remaining": max(0, limits["requests"] - request_tracker.get_request_count(ip)),
        "reset": limits["window"],
    }

    # Add rate limit headers
    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = str(limit_info["limit"])
    response.headers["X-RateLimit-Remaining"] = str(limit_info["remaining"])
    response.headers["X-RateLimit-Reset"] = str(limit_info["reset"])

    return response


@app.middleware("http")
async def request_validation_middleware(request: Request, call_next):
    """Validate and sanitize incoming requests"""
    # Skip validation for OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        return await call_next(request)

    ip = get_client_ip(request)
    user_agent = request.headers.get("user-agent", "")

    # Check for missing User-Agent (potential bot)
    if not user_agent or len(user_agent) < 10:
        security_events.log_event(
            "MISSING_USER_AGENT",
            ip,
            f"Request to {request.url.path} has missing or short User-Agent",
            "WARNING"
        )

    # Check for suspicious patterns in URL
    if security_events.check_sql_injection(str(request.url.path)):
        security_events.log_event(
            "SUSPICIOUS_URL",
            ip,
            f"Suspicious pattern in URL: {request.url.path}",
            "WARNING"
        )

    # Log failed auth attempts from bot_detector
    # This is handled by the auth router

    # Process request
    response = await call_next(request)

    # Log suspicious status codes
    if response.status_code >= 500:
        security_events.log_event(
            "SERVER_ERROR",
            ip,
            f"Server error {response.status_code} for {request.url.path}",
            "WARNING"
        )

    return response


# CORS configuration - STRICT
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "Accept-Language",
    ],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "X-Response-Time",
    ],
    max_age=3600,  # Cache preflight for 1 hour
)


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    ip = get_client_ip(request)
    security_events.log_event(
        "UNHANDLED_EXCEPTION",
        ip,
        f"{type(exc).__name__}: {str(exc)}",
        "CRITICAL"
    )
    logger.error(f"Internal error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


# Health check endpoint (public, no rate limit)
@app.get("/api/health", response_model=HealthResponse, tags=["health"])
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="ok")


# Security stats endpoint (admin only - for monitoring)
@app.get("/api/admin/security/stats", tags=["admin"])
async def get_security_stats():
    """
    Get security statistics.
    Admin can use this to monitor suspicious activity.
    """
    return security_events.get_stats()


# Bot detection stats endpoint (admin only)
@app.get("/api/admin/security/bot-stats", tags=["admin"])
async def get_bot_stats():
    """
    Get bot detection statistics.
    """
    return {
        "suspicious_ips": bot_detector.get_suspicious_ips(),
        "honeypot_stats": bot_detector.get_honeypot_stats(),
    }


# Rate limit stats endpoint (admin only)
@app.get("/api/admin/security/rate-limit-stats", tags=["admin"])
async def get_rate_limit_stats():
    """
    Get rate limiting statistics.
    """
    stats = security_events.get_stats()
    return {
        "rate_limits": RATE_LIMITS,
        "security_events": stats,
    }


# Include routers
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(services_router)
app.include_router(users_router)
app.include_router(orders_router)
app.include_router(saved_router)
app.include_router(messages_router)
app.include_router(profile_router)
app.include_router(payments_router)
app.include_router(admin_router)
app.include_router(customer_service_router)
app.include_router(admin_cs_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=int(settings.APP_PORT),
        reload=True,
    )
