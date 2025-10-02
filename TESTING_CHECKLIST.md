# Real Estate CRM - Complete Testing Checklist

## 🔐 Authentication & User Management
- [ ] **User Registration**
  - [ ] Register with valid email/password
  - [ ] Register with invalid email format (should show error)
  - [ ] Register with weak password (should show error)
  - [ ] Register with existing email (should show error)
  - [ ] After registration, user should be automatically logged in

- [ ] **User Login**
  - [ ] Login with correct credentials
  - [ ] Login with wrong password (should show error)
  - [ ] Login with non-existent email (should show error)
  - [ ] Login should redirect to dashboard

- [ ] **Session Management**
  - [ ] Login persists after page refresh
  - [ ] Logout clears session and redirects to home
  - [ ] 10-minute inactivity timeout works (wait 10+ minutes, should auto-logout)
  - [ ] User activity resets inactivity timer (mouse move, click, scroll)

## 🏠 Home Page
- [ ] **Unauthenticated User**
  - [ ] Shows "Get started" and "Sign in" buttons
  - [ ] Links work correctly

- [ ] **Authenticated User**
  - [ ] Shows "Go to Dashboard" and "View Leads" buttons
  - [ ] Links work correctly

## 📊 Dashboard
- [ ] **Navigation**
  - [ ] Shows welcome message with user email
  - [ ] All navigation cards work (Leads, Add Lead, Analytics)
  - [ ] Back button works (if present)

## 👥 Lead Management
- [ ] **Lead List Page**
  - [ ] Displays all leads in table format
  - [ ] Search functionality works (by name, email, phone)
  - [ ] Status filter chips work (New, Contacted, Qualified, etc.)
  - [ ] Pagination works (if more than 10 leads)
  - [ ] Status badges show correct colors
  - [ ] "View" button navigates to lead detail
  - [ ] "Add Lead" button works
  - [ ] Back button works

- [ ] **Add/Edit Lead Form**
  - [ ] All form fields work (first name, last name, email, phone, status, source, budget, property interest)
  - [ ] Form validation works (required fields)
  - [ ] Status dropdown shows all options
  - [ ] Budget min/max validation works
  - [ ] Save button creates new lead
  - [ ] Cancel button works
  - [ ] After saving, redirects to lead list
  - [ ] Edit mode works (when editing existing lead)

- [ ] **Lead Detail Page**
  - [ ] Shows all lead information clearly
  - [ ] Status badge displays with correct color
  - [ ] Status dropdown works (can change status)
  - [ ] Activity timeline shows existing activities
  - [ ] Add activity form works
  - [ ] Activity types dropdown works (Call, Email, Meeting, etc.)
  - [ ] Activity date/time picker works
  - [ ] Duration field accepts numbers
  - [ ] New activities appear immediately in timeline
  - [ ] Back button works

## 📈 Analytics Dashboard
- [ ] **Charts and Statistics**
  - [ ] Total leads count displays correctly
  - [ ] Qualified leads count displays correctly
  - [ ] Conversion rate calculates correctly
  - [ ] Bar chart shows leads by status
  - [ ] Pie chart shows status distribution
  - [ ] Charts are responsive and readable
  - [ ] Recent activities list shows correctly
  - [ ] Lead names display properly (not "Unknown Lead")
  - [ ] Back button works

## 🎨 UI/UX Testing
- [ ] **Color Scheme**
  - [ ] Light theme applied consistently
  - [ ] Status badges have correct colors
  - [ ] Text is readable (good contrast)
  - [ ] Buttons have proper hover states

- [ ] **Navigation**
  - [ ] Navbar shows correct links based on auth status
  - [ ] Active page is highlighted in navbar
  - [ ] All back buttons work
  - [ ] Breadcrumbs work (if present)

- [ ] **Responsive Design**
  - [ ] Works on desktop (1920x1080)
  - [ ] Works on tablet (768px)
  - [ ] Works on mobile (375px)
  - [ ] Tables are scrollable on small screens

## 🔧 Technical Testing
- [ ] **API Integration**
  - [ ] All API calls work without errors
  - [ ] Error handling works (network issues, server errors)
  - [ ] Loading states show properly
  - [ ] JWT tokens are handled correctly

- [ ] **Data Persistence**
  - [ ] Leads are saved to database
  - [ ] Activities are saved to database
  - [ ] User sessions persist
  - [ ] Data survives page refresh

- [ ] **Performance**
  - [ ] Pages load quickly
  - [ ] No console errors
  - [ ] No memory leaks
  - [ ] Smooth transitions

## 🚀 Deployment Readiness
- [ ] **Environment Setup**
  - [ ] Backend runs on port 8000
  - [ ] Frontend runs on port 5173
  - [ ] Database migrations are applied
  - [ ] CORS is configured correctly

- [ ] **Production Checklist**
  - [ ] No hardcoded localhost URLs
  - [ ] Environment variables are set
  - [ ] Static files are served correctly
  - [ ] Database is production-ready (PostgreSQL)

## 🧪 Edge Cases
- [ ] **Empty States**
  - [ ] No leads message displays
  - [ ] No activities message displays
  - [ ] Empty search results

- [ ] **Error States**
  - [ ] Network connection lost
  - [ ] Server returns 500 error
  - [ ] Invalid data submitted
  - [ ] Token expires during use

- [ ] **Data Validation**
  - [ ] Very long names/emails
  - [ ] Special characters in fields
  - [ ] Negative budget values
  - [ ] Future dates for activities

## 📱 Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 🎯 Quick Test Script (5 minutes)
1. Register new user → Login → Dashboard
2. Add a new lead with all fields
3. View lead detail → Add activity → Change status
4. Go to Analytics → Check charts and recent activities
5. Test search and filters on leads page
6. Test logout and login persistence

**Expected Result**: All features work smoothly with no errors in console.
