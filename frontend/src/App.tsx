import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./auth/ProtectedRoute";
import { AuthProvider } from "./auth/AuthProvider";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import LeadList from "./pages/LeadList";
import LeadDetail from "./pages/LeadDetail";
import LeadForm from "./pages/LeadForm";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="p-6">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads"
              element={
                <ProtectedRoute>
                  <LeadList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/new"
              element={
                <ProtectedRoute>
                  <LeadForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id"
              element={
                <ProtectedRoute>
                  <LeadDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leads/:id/edit"
              element={
                <ProtectedRoute>
                  <LeadForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
