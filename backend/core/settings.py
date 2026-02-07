from pathlib import Path
from environ import environ
import os

env = environ.Env()
environ.Env.read_env()

BASE_DIR = Path(__file__).resolve().parent.parent


DJANGO_SECRET_KEY="django-insecure-9xk4%p7v!s@3q^c2m&6z#y$8r_5=+w@a!e0nq^%l7h*b"

DEBUG = env("DJANGO_DEBUG", default=False)

ALLOWED_HOSTS = ["*"]

DJANGO_JWT_SECRECT_KEY = "pOkxE2zh2oRkySr7ZtR5mS2zRxlJVHHpjIlQ451KUKR"
JWT_ALGORITHM = "HS256"

SECURE_SSL_REDIRECT = env("SECURE_SSL_REDIRECT", default=False)
SESSION_COOKIE_SECURE = env("SESSION_COOKIE_SECURE", default=False)
CSRF_COOKIE_SECURE = env("CSRF_COOKIE_SECURE", default=False)

AUTH_USER_MODEL = "accounts.User"

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # custom apps
    "accounts",
    "firm",
    "portal",
    "drf_spectacular",
]

SPECTACULAR_SETTINGS = {
    "TITLE": "FirmBzz API",
    "DESCRIPTION": "Backend APIs",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "core.middleware.AuthMiddleware",
]

ROOT_URLCONF = "core.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "core.wsgi.application"

REST_FRAMEWORK = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR , 'db.sqlite3'),
    }
}


# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": env("DATABASE_NAME"),
#         "USER": env("DATABASE_USER"),
#         "PASSWORD": env("DATABASE_PASS"),
#         "HOST": env("DATABASE_HOST"),
#         "PORT": env("DATABASE_PORT"),
#     }
# }

AUTH_USER_MODEL = "accounts.User"


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]
CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True

EXCLUDED_PATHS = [
    "/accounts/login/",
    "/api/docs/",
    "/media/",
    "/admin/",
]





LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "filters": {
        "require_debug_true": {
            "()": "django.utils.log.RequireDebugTrue",
        }
    },
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {message} ({pathname}:{lineno})",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "filters": ["require_debug_true"],
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        }
    },
    "loggers": {
        "django.db.backends": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False,
        },
        "revonera.performance": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
        "revonera.blob": {
            "level": "DEBUG",
            "handlers": ["console"],
            "propagate": False,
        },
        "gunicorn.access": {
            "level": "INFO",
            "handlers": ["console"],
            "propagate": False,
        },
    },
}
