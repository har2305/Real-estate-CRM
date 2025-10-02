# Real Estate CRM - Deployment Guide

## 🚀 Quick Start (Development)

### Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git installed

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Run Both Together
```bash
# From project root
cd frontend
npm run dev:all
```

## 🏗️ Production Deployment

### Backend (Django + PostgreSQL)

#### 1. Environment Setup
```bash
# Install PostgreSQL
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb real_estate_crm

# Create user
sudo -u postgres createuser --interactive
```

#### 2. Environment Variables
Create `.env` file in backend directory:
```env
DEBUG=False
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://username:password@localhost:5432/real_estate_crm
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

#### 3. Django Settings
Update `backend/settings.py`:
```python
import os
from dotenv import load_dotenv

load_dotenv()

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
SECRET_KEY = os.getenv('SECRET_KEY')
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'real_estate_crm',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
```

#### 4. Deploy with Gunicorn
```bash
# Install Gunicorn
pip install gunicorn

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic

# Start with Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:8000
```

### Frontend (React + Vite)

#### 1. Build for Production
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview
```

#### 2. Serve with Nginx
Create nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /path/to/backend/staticfiles/;
    }
}
```

## 🐳 Docker Deployment

### Backend Dockerfile
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
```

### Frontend Dockerfile
```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  db:
    image: postgres:13
    environment:
      POSTGRES_DB: real_estate_crm
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/real_estate_crm
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## 🔧 Configuration

### CORS Settings
```python
# backend/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yourdomain.com",
]

CORS_ALLOW_CREDENTIALS = True
```

### JWT Settings
```python
# backend/settings.py
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

## 📊 Monitoring & Logging

### Django Logging
```python
# backend/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

## 🔒 Security Checklist

- [ ] Change default SECRET_KEY
- [ ] Set DEBUG=False in production
- [ ] Configure ALLOWED_HOSTS
- [ ] Use HTTPS in production
- [ ] Set up proper CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database SSL
- [ ] Set up proper file permissions
- [ ] Configure firewall rules
- [ ] Regular security updates

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS_ALLOWED_ORIGINS in settings
   - Verify frontend URL matches backend CORS config

2. **Database Connection**
   - Verify PostgreSQL is running
   - Check database credentials
   - Ensure database exists

3. **Static Files Not Loading**
   - Run `python manage.py collectstatic`
   - Check STATIC_ROOT and STATIC_URL settings
   - Verify nginx configuration

4. **JWT Token Issues**
   - Check token expiration settings
   - Verify JWT_SECRET_KEY
   - Check token refresh logic

### Logs Location
- Django logs: `backend/django.log`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`

## 📈 Performance Optimization

### Backend
- Use database connection pooling
- Enable gzip compression
- Set up Redis for caching
- Use CDN for static files

### Frontend
- Enable gzip compression
- Use CDN for assets
- Implement lazy loading
- Optimize bundle size

## 🔄 Backup Strategy

### Database Backup
```bash
# Daily backup
pg_dump real_estate_crm > backup_$(date +%Y%m%d).sql

# Restore
psql real_estate_crm < backup_20240101.sql
```

### File Backup
```bash
# Backup media files
tar -czf media_backup_$(date +%Y%m%d).tar.gz media/
```

---

## 📞 Support

For deployment issues:
1. Check logs first
2. Verify environment variables
3. Test database connection
4. Check network connectivity
5. Review security settings
