# Real Estate CRM

A modern, full-stack Customer Relationship Management system built specifically for real estate professionals. Manage leads, track activities, and analyze your sales pipeline with an intuitive web interface.

## 🏠 Features

- **Lead Management**: Create, edit, and track real estate leads
- **Activity Tracking**: Log calls, emails, meetings, and notes for each lead
- **Status Pipeline**: Move leads through stages (New → Contacted → Qualified → Negotiation → Closed/Lost)
- **Analytics Dashboard**: Visual insights into your sales pipeline and conversion rates
- **User Authentication**: Secure login and registration system
- **Soft Delete**: Safely remove leads with restore functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Django 5.2** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Database (easily switchable to PostgreSQL/MySQL)
- **JWT Authentication** - Secure token-based auth
- **Pytest** - Testing framework

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Jest** - Testing framework

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Real-estate-CRM
```

### 2. Backend Setup

#### Create Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Database Setup
```bash
python manage.py migrate
python manage.py createsuperuser
```

#### Start Backend Server
```bash
python manage.py runserver
```
Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Frontend Server
```bash
npm run dev
```
Frontend will be available at `http://localhost:5173`

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/

## 📋 Usage Guide

### Getting Started
1. **Register** a new account or **login** with existing credentials
2. **Create your first lead** using the "Add Lead" button
3. **Track activities** by adding calls, emails, or notes to leads
4. **Update lead status** as they progress through your pipeline
5. **View analytics** to understand your conversion rates

### Lead Management
- **Add Lead**: Click "Add Lead" to create new prospects
- **Edit Lead**: Click on any lead to view details and edit information
- **Update Status**: Change lead status as they progress (New → Contacted → Qualified → Negotiation → Closed/Lost)
- **Add Activities**: Log interactions with leads (calls, emails, meetings, notes)
- **Delete Lead**: Soft delete leads (can be restored from "Deleted Leads" page)

### Analytics Dashboard
- **Total Leads**: See your complete lead count
- **Status Breakdown**: Visual representation of leads by status
- **Conversion Rate**: Percentage of leads that closed successfully
- **Recent Activities**: Latest interactions across all leads

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest crm/test_models.py
```

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
- **Backend**: Models, serializers, views, and API endpoints
- **Frontend**: Components, pages, authentication, and user interactions

## 🔧 Development

### Project Structure
```
Real-estate-CRM/
├── backend/                 # Django backend
│   ├── accounts/           # User authentication
│   ├── crm/               # Lead and activity management
│   ├── backend/           # Django settings and configuration
│   └── manage.py          # Django management script
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── auth/          # Authentication logic
│   │   └── lib/           # API and utilities
│   └── package.json       # Frontend dependencies
└── README.md              # This file
```

### API Endpoints
- `GET /api/leads/` - List all leads
- `POST /api/leads/` - Create new lead
- `GET /api/leads/{id}/` - Get lead details
- `PATCH /api/leads/{id}/` - Update lead
- `DELETE /api/leads/{id}/` - Soft delete lead
- `POST /api/leads/{id}/restore/` - Restore deleted lead
- `GET /api/analytics/` - Get analytics data
- `GET /api/activities/recent/` - Get recent activities

### Environment Variables
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

## 🚀 Deployment

### Quick Deployment (Recommended for Assignment)

**Backend (Render):**
1. Create PostgreSQL database on [render.com](https://render.com)
2. Create Web Service with:
   - Build Command: `./build.sh`
   - Start Command: `gunicorn backend.wsgi:application`
   - Environment Variables: `SECRET_KEY`, `DEBUG=False`, `DATABASE_URL`, `CORS_ALLOWED_ORIGINS`

**Frontend (Vercel):**
1. Import repository to [vercel.com](https://vercel.com)
2. Set Root Directory: `frontend`
3. Environment Variable: `VITE_API_URL=https://your-backend.onrender.com/api`

📖 **Detailed deployment guide**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### Production Setup (Manual)
1. **Set up production database** (PostgreSQL recommended)
2. **Configure environment variables**
3. **Set DEBUG=False** in settings
4. **Collect static files**: `python manage.py collectstatic`
5. **Use production WSGI server** (Gunicorn, uWSGI)
6. **Set up reverse proxy** (Nginx, Apache)
7. **Configure SSL certificates**

### Docker Deployment (Optional)
```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **CORS protection** for API endpoints
- **Input validation** on all forms
- **SQL injection protection** via Django ORM
- **XSS protection** with React's built-in escaping
- **CSRF protection** for state-changing operations

## 📊 Database Schema

### Lead Model
- Personal information (name, email, phone)
- Status tracking (new, contacted, qualified, negotiation, closed, lost)
- Budget information (min/max)
- Property interests and source tracking
- Soft delete functionality

### Activity Model
- Activity type (call, email, meeting, note)
- Title and detailed notes
- Date and duration tracking
- User attribution

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for all frontend code
- Write tests for new features
- Update documentation as needed
- Use meaningful commit messages

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

**Backend won't start:**
- Check Python version (3.11+ required)
- Ensure virtual environment is activated
- Run `pip install -r requirements.txt`

**Frontend build fails:**
- Check Node.js version (18+ required)
- Delete `node_modules` and run `npm install`
- Clear npm cache: `npm cache clean --force`

**Database errors:**
- Run `python manage.py migrate`
- Check database permissions
- Verify database connection settings

**Authentication issues:**
- Check JWT token expiration
- Verify CORS settings
- Ensure API endpoints are accessible

### Getting Help
- Check the [Issues](https://github.com/your-repo/issues) page
- Review the documentation
- Contact the development team

## 🌐 Live Demo

### Demo Credentials
- **Username**: `demo@example.com`
- **Password**: `demo123456`

### Production URLs
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-backend.onrender.com/api/`
- **Admin Panel**: `https://your-backend.onrender.com/admin/`

## 🎯 Roadmap

- [ ] Email integration for lead notifications
- [ ] Calendar integration for meeting scheduling
- [ ] Document upload and management
- [ ] Advanced reporting and analytics
- [ ] Mobile app development
- [ ] Multi-tenant support
- [ ] API rate limiting
- [ ] Automated lead scoring

---

**Built with ❤️ for real estate professionals**T r i g g e r i n g   V e r c e l   r e d e p l o y  
 