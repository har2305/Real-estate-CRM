# Deployment Guide for Real Estate CRM

This guide will help you deploy the Real Estate CRM application to production using Render (backend) and Vercel (frontend).

## 🚀 Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. **Create a PostgreSQL Database on Render:**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" → "PostgreSQL"
   - Choose "Free" plan
   - Name your database (e.g., "real-estate-crm-db")
   - Note down the connection details

2. **Create Web Service on Render:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Choose the repository: `Real-estate-CRM`
   - Configure the service:
     - **Name**: `real-estate-crm-backend`
     - **Root Directory**: `backend`
     - **Build Command**: `./build.sh`
     - **Start Command**: `gunicorn backend.wsgi:application`
     - **Plan**: Free

3. **Environment Variables:**
   Add these environment variables in Render dashboard:
   ```
   SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
   DEBUG=False
   ALLOWED_HOSTS=your-backend-name.onrender.com
   DATABASE_URL=postgresql://username:password@host:port/database_name
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app
   ```

4. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note your backend URL (e.g., `https://real-estate-crm-backend.onrender.com`)

## 🎨 Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

1. **Go to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account

2. **Import Project:**
   - Click "New Project"
   - Import your GitHub repository: `Real-estate-CRM`
   - Configure the project:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

3. **Environment Variables:**
   Add this environment variable:
   ```
   VITE_API_URL=https://your-backend-name.onrender.com/api
   ```

4. **Deploy:**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note your frontend URL (e.g., `https://real-estate-crm.vercel.app`)

## 🔧 Post-Deployment Setup

### Step 1: Create Superuser

1. **Access Render Console:**
   - Go to your Render dashboard
   - Click on your web service
   - Go to "Shell" tab

2. **Create Superuser:**
   ```bash
   python manage.py createsuperuser
   ```
   - Enter username, email, and password
   - This will be your admin credentials

### Step 2: Test the Application

1. **Test Backend API:**
   - Visit: `https://your-backend.onrender.com/api/`
   - Should see API endpoints

2. **Test Frontend:**
   - Visit: `https://your-frontend.vercel.app`
   - Try registering a new account
   - Test all features

## 🌐 Production Information

### Demo Credentials
Create a test account with these credentials:
- **Username**: `demo@example.com`
- **Password**: `demo123456`

### Production URLs
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.onrender.com/api/`
- **Admin Panel**: `https://your-backend.onrender.com/admin/`

### GitHub Repository
- **Repository URL**: `https://github.com/your-username/Real-estate-CRM`

## 🐛 Troubleshooting

### Common Issues:

1. **Build Fails on Render:**
   - Check that `build.sh` is executable
   - Verify all dependencies are in `requirements.txt`
   - Check environment variables

2. **CORS Errors:**
   - Update `CORS_ALLOWED_ORIGINS` with your frontend URL
   - Redeploy backend

3. **Database Connection Issues:**
   - Verify `DATABASE_URL` is correct
   - Check PostgreSQL service is running

4. **Frontend Can't Connect to Backend:**
   - Verify `VITE_API_URL` is correct
   - Check backend is deployed and running

## 📝 Final Checklist

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Database connected and migrated
- [ ] Superuser created
- [ ] Test account created
- [ ] All features working
- [ ] URLs documented
- [ ] Ready for production use

## 🎯 Next Steps

1. **Test thoroughly** - Make sure all features work
2. **Create demo data** - Add some sample leads and activities
3. **Monitor performance** - Check logs and optimize as needed
4. **Scale as needed** - Upgrade plans when ready for production use
